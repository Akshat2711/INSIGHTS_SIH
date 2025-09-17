from fastapi import FastAPI, HTTPException, Query,UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
import asyncio
import threading
import concurrent.futures
import os
import uvicorn
import requests

from utils.post_to_numbers import run_scoring_pipeline_firestore
from utils.Firestore_db import FirestoreUserManager
from utils.score_updater import update_scores_for_role_changes, run_async

import logging
import firebase_admin
from firebase_admin import credentials, firestore

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
try:
    # Initialize Firebase app if not already initialized
    if not firebase_admin._apps:
        # Directly embed Firebase credentials
        firebase_config = {
            "type": "service_account",
            "project_id": "insights-dd046",
            "private_key_id": "7b5c929a60a14be4328c623c2a787df8671ac792",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDfdDctoONztDhR\nGPbux28vq+vN3Pq9FMBofmv4UxgPO81euRtNgn5QwXi7QtgwLJSSXZGa2M3dw6gd\nr7qg0LyIw9JrTgnY2AeMP3Tsfj6R23jR4wrN1SZxDDpgrCaLhBtW4tiiwEa+5GVq\nLd9TQAvyEpZpexemh400JPpUkGhNTXozLYetFDdXEb/4+KH52i6RLgTcqkA9VShb\nNcYtwFxYHQ7kYrt/Ga9uaxmpJwFLFRYY2Zt0/4ObhULIVCggXsWDB6upP7YsX3uZ\nAQOhTtnYeDn3l97sJxaXr3Pg8cWr8NhkxxA19TBghlspfmJvTGceMX5HxdVen7b4\nK/c4qgtBAgMBAAECggEAWwB3YEu/leV1cgGavw/VhjKb69DtBIgo++VQj2c3yyxt\nrP/x0JUuYDEKvCiy5puhPiKBI/Dblk8SblScytV3krM9RJoZhIgmOsW1FoMrdDdP\ncxrl0YHXD/8M30X8xKDeiXoFA/MOXLujWaSo6LySoNlVDEwnC5j0tqHAmSPedmwu\nYPqfvN2QJQ8MIS8Tq0o2Exzhb7MNyzwHrLAtY0eTBnvYMrb1QcRI35SXJop5XRpB\n/vGCeR9wporJhz7PJdU9DqXQd09IuGRHp4Q0qXmNNjxmW5JIMuTfsBsaGNU3uuas\nhkUlzir460TJwwqM3G50EtIUOHRq9Gkh+Mt/rfEYCQKBgQDxGxQzIqnZxvd9o1gC\nBew0fa6z1Woxkg0CQfGExPiHwVH3syGDRZEZ3c+9uuVORmgnDnFrwJB2bT0IVTR6\nufeKjaOR5lr6fsiaqw7hpFKLvTryRS8xLVcNIQ7lzUvDJ2m6Us/MOpP9keWIQEat\ncIsBgTipTg3xb8W4Ld9MWsE5LwKBgQDtQfxHrHQGLWmlpM3era6LR8gXpVCxqoQl\nK8ej/z6XPZVBhj6XgDV59iYVyTeq2aueZu6vemfIgUsWAFQBYMJ58Cox698JEPfP\nm+aLXVwoM9EZqE/5EQpxu+Pi2Ra0sLPvWZlh1mzjygbtHe4aGbbmG/uLxGbsditK\nQfguFdwGjwKBgETxbVFB9DelwVdXwe6yKtzHo5Eg0YDjNn0SxjEk8bw/92RRAKA8\n4ET5PFIQg0lisJ2ab6xUH/r9OZqMYrlFPBeOcNtjd1hxsIMprtOu3TvAHH7ycZAq\nWt4SOeRUU/m153G0BF9t0KuNcIkJeCxYJieD/+PJwgrr3ynPVC7NNLtZAoGBAOta\ngJrM3I9gLyPM9xeE7NdnTnr+V6zWfJ2u7yykv38h7NSCCccZvHKOlbsYzurhYFgS\nvYU/BIKml0hs7OgtBt4VOpYo6CfDOEAu46St6QRMWol8KFDm8ZhfDTFzrg1yGBw/\nomKmZYAVYYeIIDCt/3wGmCJOotbAZjMUe8+jiY7LAoGAavsIoVgTgm3aFDHvWdch\ndLFK1tWNhEeBX/0DztT/Z2Roi/U8597tiiJB/ewtTolbobJhJUiU6to51WMeg/7m\nPR6XOgq6djFWepcJh4Sb/M+0V9w2MsVG1DDVsE2UG3/4w0CN2uiyCC7TFR6UM1Us\nnKfaJeDwkze4m2yyXNZb9DE=\n-----END PRIVATE KEY-----\n",
            "client_email": "firebase-adminsdk-fbsvc@insights-dd046.iam.gserviceaccount.com",
            "client_id": "104231717986596851073",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40insights-dd046.iam.gserviceaccount.com",
            "universe_domain": "googleapis.com"
        }
        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    logger.info("Firebase initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Firebase: {e}")
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

# Global persistent scraper
scraper = None

# Create a single background event loop for Playwright/scraper work and start it in a thread
def _start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

_bg_loop = asyncio.new_event_loop()
_bg_thread = threading.Thread(target=_start_background_loop, args=(_bg_loop,), daemon=True)
_bg_thread.start()

def run_async(coro, timeout: float | None = None):
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
        # Return mock data for development when Firestore is not available
        mock_user_data = {
            "name": f"User {userid}",
            "total_points": 1000,
            "profile_strength": 80,
            "post_engagement": 350,
            "connections": 500,
            "skills": ["Python", "React", "Data Analysis"],
            "recent_posts": [
                {"content": "Excited to share my latest project!", "likes": 25, "comments": 5},
                {"content": "Great networking event today.", "likes": 18, "comments": 3}
            ]
        }
        return {"user_data": mock_user_data}
    
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
        # Return mock data for development when Firestore is not available
        mock_users = {
            "user1": {
                "name": "John Doe",
                "total_points": 1250,
                "profile_strength": 85,
                "post_engagement": 420,
                "connections": 580
            },
            "user2": {
                "name": "Jane Smith", 
                "total_points": 1100,
                "profile_strength": 78,
                "post_engagement": 380,
                "connections": 520
            },
            "user3": {
                "name": "Alice Johnson",
                "total_points": 950,
                "profile_strength": 72,
                "post_engagement": 320,
                "connections": 450
            }
        }
        return {"all_users": mock_users}
    
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
        # Return mock success response for development
        logger.info(f"Mock scraping simulation for user: {userid}")
        return {
            "success": True, 
            "message": f"Mock data refresh completed for user {userid} (Firestore not connected)",
            "mock_data": {
                "posts_scraped": 15,
                "engagement_score": 85,
                "profile_strength": 78
            }
        }

    async def scrape_async():
        try:
            logger.info(f"Started scrapping data for user: {userid}")

            # Get or create persistent scraper
            current_scraper = await get_or_create_scraper()
            
            # Step 1: Scrape data using persistent scraper
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

    # Run async function in shared background loop and return result
    try:
        result = run_async(scrape_async(), timeout=180)
        return result
    except Exception as e:
        logger.error(f"Scraping invocation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))




@app.get('/getleaderboard')
async def get_leaderboard():
    """Get users ranked by total points - useful for leaderboard displays."""
    if not firestore_manager:
        # Return mock leaderboard data for development
        mock_leaderboard = [
            {"rank": 1, "user_id": "john-doe", "total_points": 1250, "name": "John Doe"},
            {"rank": 2, "user_id": "jane-smith", "total_points": 1100, "name": "Jane Smith"},
            {"rank": 3, "user_id": "alice-johnson", "total_points": 950, "name": "Alice Johnson"},
            {"rank": 4, "user_id": "bob-wilson", "total_points": 850, "name": "Bob Wilson"},
            {"rank": 5, "user_id": "carol-davis", "total_points": 750, "name": "Carol Davis"}
        ]
        return {"leaderboard": mock_leaderboard}
    
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






# Route to update no. after role added/updated by user
@app.post('/update_points')
async def update_marks_for_role(request_data: UpdatePointsRequest):
    try:
        print("=== UPDATE POINTS REQUEST ===")
        
        # Get username and role data from request
        username = request_data.username
        role_data = request_data.roles
        
        print(f"Username: {username}")
        print(f"Role data keys count: {len(role_data) if role_data else 0}")
        
        if not username:
            raise HTTPException(status_code=400, detail="Username is required")
            
        if not firestore_manager:
            raise HTTPException(status_code=500, detail="Firestore manager not initialized")
            
        print("Updating roles in Firestore...")
        # Update role data in Firestore
        success = firestore_manager.update_user_roles(username, role_data)
        if not success:
            print("Failed to update roles")
            raise HTTPException(status_code=500, detail="Failed to update roles")
        
        print("Roles updated successfully, recalculating scores...")
        # Use the efficient score update function instead of full pipeline
        scored_data = run_async(update_scores_for_role_changes(
            username=username,
            updated_roles=role_data,
            scoring_matrix_file=os.path.join(os.path.dirname(__file__), "ranking_criteria_metrics", "placement_ranking.json"),
            firestore_manager=firestore_manager
        ))
        
        print("Score update completed successfully")
        return {
            "message": "Points updated successfully",
            "scored_data": scored_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in update_marks_for_role: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
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
        # Return mock search results for development
        mock_results = [
            {
                "rank": 1,
                "user_id": "john-doe",
                "name": "John Doe",
                "keyword_occurrences": 8,
                "total_points": 1250,
                "sample_matches": [f"Passionate about {keyword} and innovation"]
            },
            {
                "rank": 2, 
                "user_id": "jane-smith",
                "name": "Jane Smith",
                "keyword_occurrences": 5,
                "total_points": 1100,
                "sample_matches": [f"Working on {keyword} projects"]
            }
        ]
        return {
            "keyword": keyword,
            "total_results": 2,
            "top_users": mock_results[:limit]
        }
    
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
    if not firestore_manager:
        # Return mock success for development
        return {
            "success": True,
            "message": f"Mock GitHub data refresh completed for {github_id} (Firestore not connected)"
        }
    
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
    async def cleanup_async():
        global scraper
        if scraper:
            await scraper.cleanup()
            scraper = None
            return {"success": True, "message": "Scraper cleaned up successfully"}
        return {"success": True, "message": "No scraper to cleanup"}

    try:
        result = run_async(cleanup_async(), timeout=60)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    if not firestore_manager:
        logger.warning("Starting app without Firestore connection")

@app.on_event("shutdown")
async def shutdown_event():
    # Cleanup scraper on app shutdown
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

if __name__ == '__main__':
    
    uvicorn.run(app, host="0.0.0.0", port=8080)