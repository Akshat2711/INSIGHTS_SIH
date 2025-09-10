from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import asyncio
import threading
import concurrent.futures
import os

from utils.post_to_numbers import run_scoring_pipeline_firestore
from utils.Firestore_db import FirestoreUserManager

import logging
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
try:
    # Initialize Firebase app if not already initialized
    if not firebase_admin._apps:
        # Use service account key file
        rel_path_for_cred = os.path.join(os.path.dirname(__file__), "..")
        cred = credentials.Certificate(os.path.join(rel_path_for_cred, "backend_firestore_cred.json"))

        # Or use default credentials if running on Google Cloud
        # cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    logger.info("Firebase initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Firebase: {e}")
    db = None

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Initialize Firestore manager
firestore_manager = FirestoreUserManager(db) if db else None

# Global persistent scraper
scraper = None

# Create a single background event loop for Playwright/scraper work and start it in a thread
def _start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

_bg_loop = asyncio.new_event_loop()
_bg_thread = threading.Thread(target=_start_background_loop, args=(_bg_loop,), daemon=True)
_bg_thread.start()

def run_async(coro, timeout: float = None):
    """Run coroutine in the shared background loop and return result (raises on exception)."""
    fut = asyncio.run_coroutine_threadsafe(coro, _bg_loop)
    return fut.result(timeout)

async def get_or_create_scraper():
    global scraper
    from utils.profile_scrap import LinkedInScraper
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        current_loop = None

    # No scraper yet -> create one
    if scraper is None:
        scraper = LinkedInScraper(headless=True)
        return scraper

    # If existing scraper was created in the same loop and is usable, reuse it
    try:
        if scraper.can_be_used_in_loop():
            return scraper
    except Exception:
        # fall through to recreate
        pass

    # If the scraper was created in the same loop, attempt to cleanup (safe to await)
    try:
        if getattr(scraper, "creation_loop", None) == current_loop:
            await scraper.cleanup()
    except Exception:
        # ignore cleanup errors but do not try to await cross-loop cleanup
        pass

    # create a fresh scraper for the current loop
    scraper = LinkedInScraper(headless=False)
    return scraper

# Routes
@app.route('/senduserinfo', methods=['GET', 'POST'])
def send_user_info():
    """Get single user info from Firestore."""
    if not firestore_manager:
        return jsonify({"error": "Firestore not initialized"}), 500
    
    user_id = request.args.get('userid')
    if not user_id:
        return jsonify({"error": "userid parameter is required"}), 400
    
    try:
        user_data = firestore_manager.get_user_data(user_id)
        if user_data:
            return jsonify({"user_data": user_data})
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/getallusers', methods=['GET'])
def get_all_users():
    """Get all users sorted by total points from Firestore."""
    if not firestore_manager:
        return jsonify({"error": "Firestore not initialized"}), 500
    
    try:
        all_users = firestore_manager.get_all_users_sorted()
        return jsonify({"all_users": all_users})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/scrapdata', methods=['GET', "POST"])
def get_data_scrapper():
    """Scrape data and convert to numbers, then store in Firestore."""
    if not firestore_manager:
        return jsonify({"error": "Firestore not initialized"}), 500

    async def scrape_async():
        try:
            user_id = request.args.get('userid')
            if not user_id:
                return {"success": False, "error": "userid parameter is required"}

            logger.info(f"Started scrapping data for user: {user_id}")

            # Get or create persistent scraper
            current_scraper = await get_or_create_scraper()
            
            # Step 1: Scrape data using persistent scraper
            posts = await current_scraper.scrape_profile_activity(f"https://www.linkedin.com/in/{user_id}")
            
            # Step 2: Save to Firestore
            if firestore_manager:
                success = firestore_manager.update_original_scraping(user_id, posts)
                if not success:
                    return {"success": False, "error": "Failed to save scraping data"}

            # Step 3: Convert scrapped data to numbers and update Firestore
            await run_scoring_pipeline_firestore(
                user_id,
                os.path.join(os.path.dirname(__file__), "ranking_criteria_metrics", "placement_ranking.json"),
                firestore_manager
            )

            return {"success": True, "message": "Data refreshed successfully"}
            
        except Exception as e:
            logger.error(f"Error in scrapping pipeline: {e}")
            return {"success": False, "error": str(e)}

    # Run async function in shared background loop and return result
    try:
        result = run_async(scrape_async(), timeout=180)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Scraping invocation failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/getleaderboard', methods=['GET'])
def get_leaderboard():
    """Get users ranked by total points - useful for leaderboard displays."""
    if not firestore_manager:
        return jsonify({"error": "Firestore not initialized"}), 500
    
    try:
        all_users = firestore_manager.get_all_users_sorted()
        
        # Create leaderboard format
        leaderboard = []
        rank = 1
        for user_id, user_data in all_users.items():
            leaderboard.append({
                "rank": rank,
                "user_id": user_id,
                "total_points": user_data.get('total_points', 0),
                "name": user_data.get('name', user_id)  # Assuming you have name field
            })
            rank += 1
        
        return jsonify({"leaderboard": leaderboard})
    except Exception as e:
        return jsonify({"error": str(e)}), 500







#route to update no. after role added/updated by user
@app.route('/update_points', methods=['POST'])
def update_marks_for_role():
    try:
        print("=== UPDATE POINTS REQUEST ===")
        
        # Get username and role data from request
        data = request.get_json()
        print(f"Received data: {data}")
        
        username = data.get('username')
        role_data = data.get('roles', {})
        
        print(f"Username: {username}")
        print(f"Role data keys count: {len(role_data) if role_data else 0}")
        
        if not username:
            return jsonify({"error": "Username is required"}), 400
            
        if not firestore_manager:
            return jsonify({"error": "Firestore manager not initialized"}), 500
            
        print("Updating roles in Firestore...")
        # Update role data in Firestore
        success = firestore_manager.update_user_roles(username, role_data)
        if not success:
            print("Failed to update roles")
            return jsonify({"error": "Failed to update roles"}), 500
        
        print("Roles updated successfully, running scoring pipeline...")
        # Re-run scoring with updated roles
        scored_data = run_async(run_scoring_pipeline_firestore(
            username=username,
            scoring_matrix_file=os.path.join(os.path.dirname(__file__), "ranking_criteria_metrics", "placement_ranking.json"),
            firestore_manager=firestore_manager
        ))
        
        print("Scoring completed successfully")
        return jsonify({
            "message": "Points updated successfully",
            "scored_data": scored_data
        }), 200
        
    except Exception as e:
        print(f"ERROR in update_marks_for_role: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500





















#others
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    firestore_status = "connected" if firestore_manager and db else "disconnected"
    return jsonify({
        "status": "healthy",
        "firestore": firestore_status
    })

@app.route('/cleanup', methods=['POST'])
def cleanup_scraper():
    """Cleanup scraper browser when needed."""
    async def cleanup_async():
        global scraper
        if scraper:
            await scraper.cleanup()
            scraper = None
            return {"success": True, "message": "Scraper cleaned up successfully"}
        return {"success": True, "message": "No scraper to cleanup"}

    try:
        result = run_async(cleanup_async(), timeout=60)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    if not firestore_manager:
        logger.warning("Starting app without Firestore connection")
    
    # Cleanup scraper on app shutdown
    import atexit
    
    def cleanup_on_exit():
        # try to cleanup scraper and stop the background loop
        try:
            if scraper:
                # schedule cleanup in the background loop
                try:
                    run_async(scraper.cleanup(), timeout=60)
                except Exception:
                    pass
        finally:
            # stop background loop
            try:
                _bg_loop.call_soon_threadsafe(_bg_loop.stop)
            except Exception:
                pass

    atexit.register(cleanup_on_exit)
    app.run(debug=True)