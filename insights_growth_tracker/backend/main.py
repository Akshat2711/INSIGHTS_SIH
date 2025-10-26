from fastapi import FastAPI, HTTPException, Query,UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
import os
import uvicorn
import requests

from utils.post_to_numbers import run_scoring_pipeline_firestore
from utils.Firestore_db import FirestoreUserManager


import logging
import firebase_admin
from firebase_admin import credentials, firestore

import asyncio
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    if not firebase_admin._apps:
        try:
            # Load from .env
            raw_config = os.getenv("FIREBASE_CONFIG")
            if not raw_config:
                raise ValueError("FIREBASE_CONFIG missing in environment")

            firebase_config = json.loads(raw_config)
            firebase_config["private_key"] = firebase_config["private_key"].replace("\\n", "\n")

            cred = credentials.Certificate(firebase_config)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized from environment")
        
        except Exception as e_env:
            logger.warning(f"Failed to load Firebase from env: {e_env}. Trying local JSON file...")

            # Fall back to local JSON
            cred_path = os.path.join(os.path.dirname(os.getcwd()), "backend_firestore_cred.json")
            if not os.path.exists(cred_path):
                raise FileNotFoundError(f"Fallback Firebase JSON file not found at {cred_path}")

            with open(cred_path, "r") as f:
                firebase_config = json.load(f)

            cred = credentials.Certificate(firebase_config)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized from local JSON")

    db = firestore.client()
    logger.info("Firestore client initialized")

except Exception as e:
    logger.error(f"Failed to initialize Firebase: {e}", exc_info=True)
    db = None


app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firestore manager
firestore_manager = FirestoreUserManager(db) if db else None



################for persisting browser login session for faster scraping################
# Global persistent scraper
scraper = None

# Create background event loop
def _start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

_bg_loop = asyncio.new_event_loop()
_bg_thread = threading.Thread(target=_start_background_loop, args=(_bg_loop,), daemon=True)
_bg_thread.start()

def run_async(coro, timeout: float = None):
    """Run coroutine in the shared background loop."""
    fut = asyncio.run_coroutine_threadsafe(coro, _bg_loop)
    return fut.result(timeout)

async def get_or_create_scraper():
    global scraper
    from utils.profile_scrap import LinkedInScraper
    
    if scraper is None:
        scraper = LinkedInScraper(headless=True)
        return scraper
    
    try:
        if scraper.can_be_used_in_loop():
            return scraper
    except Exception:
        pass
    
    try:
        current_loop = asyncio.get_running_loop()
        if getattr(scraper, "creation_loop", None) == current_loop:
            await scraper.cleanup()
    except Exception:
        pass
    
    scraper = LinkedInScraper(headless=True)
    return scraper
###########################################################################################




# Pydantic models for request bodies
class UpdatePointsRequest(BaseModel):
    username: str
    roles: Dict[str, Any] = {}

# Routes
@app.get('/senduserinfo')
@app.post('/senduserinfo')
async def send_user_info(userid: str = Query(..., description="User ID parameter")):
    """Get single user info from Firestore."""
    if not firestore_manager:
        raise HTTPException(status_code=500, detail="Firestore not initialized")
    
    try:
        user_data = firestore_manager.get_user_data(userid)
        if user_data:
            return {"user_data": user_data}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/getallusers')
async def get_all_users():
    """Get all users sorted by total points from Firestore."""
    if not firestore_manager:
        raise HTTPException(status_code=500, detail="Firestore not initialized")
    
    try:
        all_users = firestore_manager.get_all_users_sorted()
        return {"all_users": all_users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))







@app.get('/scrapdata')
@app.post('/scrapdata')
async def get_data_scrapper(userid: str = Query(..., description="User ID parameter")):
    """Scrape data and convert to numbers, then store in Firestore."""
    if not firestore_manager:
        raise HTTPException(status_code=500, detail="Firestore not initialized")

    try:
        logger.info(f"Started scrapping data for user: {userid}")

        current_scraper = await get_or_create_scraper()
        posts = await current_scraper.scrape_profile_activity(f"https://www.linkedin.com/in/{userid}")
        

        
        # Step 2: Save to Firestore
        if firestore_manager:
            success = firestore_manager.update_original_scraping(userid, posts)
            if not success:
                return {"success": False, "error": "Failed to save scraping data"}

        # Step 3: Convert scrapped data to numbers and update Firestore
        await run_scoring_pipeline_firestore(
            userid,
            os.path.join(os.path.dirname(__file__), "ranking_criteria_metrics", "placement_ranking.json"),
            firestore_manager
        )

       

        return {"success": True, "message": "Data refreshed successfully"}
        
    except Exception as e:
        logger.error(f"Error in scrapping pipeline: {e}")
        return {"success": False, "error": str(e)}



@app.get('/getleaderboard')
async def get_leaderboard():
    """Get users ranked by total points - useful for leaderboard displays."""
    if not firestore_manager:
        raise HTTPException(status_code=500, detail="Firestore not initialized")
    
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
        
        return {"leaderboard": leaderboard}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))













#searching endpoint
@app.get('/search-users-by-keyword')
async def search_users_by_keyword(keyword: str, limit: int = 5):
    """
    Get top users based on keyword occurrence in their scraped data.
    
    Args:
        keyword: The keyword to search for
        limit: Maximum number of results to return (default: 5, max: 20)
    
    Returns:
        List of users ranked by keyword occurrence frequency
    """
    if not firestore_manager:
        raise HTTPException(status_code=500, detail="Firestore not initialized")
    
    if not keyword or not keyword.strip():
        raise HTTPException(status_code=400, detail="Keyword parameter is required")
    
    # Limit the maximum results to prevent performance issues
    limit = min(max(1, limit), 20)
    
    try:
        # Use the optimized search method
        search_results = firestore_manager.search_users_by_keyword(keyword.strip(), limit)
        
        if not search_results:
            return {
                "keyword": keyword,
                "total_results": 0,
                "message": "No users found with the specified keyword",
                "top_users": []
            }
        
        # Format results for API response
        top_users = []
        for rank, result in enumerate(search_results, 1):
            top_users.append({
                "rank": rank,
                "user_id": result['user_id'],
                "name": result['name'],
                "keyword_occurrences": result['keyword_count'],
                "total_points": result['total_points'],
                "sample_matches": result.get('matched_content', [])  # Show where keyword was found
            })
        
        return {
            "keyword": keyword,
            "total_results": len(search_results),
            "top_users": top_users
        }
        
    except Exception as e:
        logger.error(f"API error searching for keyword '{keyword}': {e}")
        raise HTTPException(status_code=500, detail=str(e))





#to handle github requests
@app.post("/refresh-github-data")
async def refresh_github_data(github_id: str, userid: str):  # Add userid parameter
    try:
        # Fetch GitHub user profile
        profile_response = requests.get(f"https://insights-sih.fly.dev/aryabytes/api/services/v1/github/user/{github_id}")
        if profile_response.status_code != 200:
            return {"success": False, "error": "GitHub user not found"}
        
        # Fetch GitHub repositories
        repos_response = requests.get(f"https://insights-sih.fly.dev/aryabytes/api/services/v1/github/user/{github_id}/repos")
        if repos_response.status_code != 200:
            return {"success": False, "error": "Failed to fetch repositories"}
        
        profile_data = profile_response.json()
        repos_data = repos_response.json()
        
        # Combine the data
        github_data = {
            "github_username": github_id,  # Store the GitHub username
            "profile": profile_data.get("data", {}),
            "repositories": repos_data.get("data", [])
        }
        
        # Save to Firestore using LinkedIn user ID
        user_manager = FirestoreUserManager(db)  # Your existing db instance
        success = user_manager.save_github_data(userid, github_data)  # Use userid (LinkedIn ID)
        
        if success:
            return {"success": True, "message": "GitHub data saved successfully"}
        else:
            return {"success": False, "error": "Failed to save GitHub data"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}



#to handle resume upload
@app.post("/upload-resume")
async def upload_resume(resume: UploadFile = File(...), userid: str = Form(...)):
    try:
        # Validate file type
        if not resume.filename.endswith('.pdf'):
            return {"success": False, "error": "Only PDF files are allowed"}
        
        # Prepare file for API call
        files = {'resume': (resume.filename, resume.file, 'application/pdf')}
        
        # Call the resume analysis API
        response = requests.post(
            'https://insights-sih.fly.dev/aryabytes/api/services/v1/resume/analyze',
            files=files
        )
        
        if response.status_code != 200:
            return {"success": False, "error": "Failed to analyze resume"}
        
        resume_data = response.json()
        
        # Save to Firestore using LinkedIn user ID
        user_manager = FirestoreUserManager(db)
        success = user_manager.save_resume_data(userid, resume_data)
        
        if success:
            return {"success": True, "message": "Resume analyzed and saved successfully"}
        else:
            return {"success": False, "error": "Failed to save resume data"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}




























# Others
@app.get('/health')
async def health_check():
    """Health check endpoint."""
    firestore_status = "connected" if firestore_manager and db else "disconnected"
    return {
        "status": "healthy",
        "firestore": firestore_status
    }



@app.post('/cleanup')
async def cleanup_scraper():
    """Cleanup scraper browser when needed."""
    global scraper
    if scraper:
        await scraper.cleanup()
        scraper = None
        return {"success": True, "message": "Scraper cleaned up successfully"}
    return {"success": True, "message": "No scraper to cleanup"}



# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    if not firestore_manager:
        logger.warning("Starting app without Firestore connection")

@app.on_event("shutdown")
async def shutdown_event():
    global scraper
    try:
        if scraper:
            await scraper.cleanup()
    except Exception:
        pass
    try:
        _bg_loop.call_soon_threadsafe(_bg_loop.stop)
    except Exception:
        pass
    logger.info("Application shutting down")




if __name__ == '__main__':
    
    uvicorn.run(app, host="0.0.0.0", port=8080)