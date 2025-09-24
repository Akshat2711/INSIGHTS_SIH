import os
import sys
import logging
from dotenv import load_dotenv
from linkedin_api import Linkedin
from typing import List, Dict, Optional
import re

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

linkedin_pass = os.getenv("Linkedin_pass", " ")
linkedin_email = os.getenv("Linkedin_email", " ")

class LinkedInScraper:
    def __init__(self):
        self.api = None
        self.is_authenticated = False
        logger.info("LinkedInScraper initialized")
    
    def authenticate(self) -> bool:
        """Authenticate with LinkedIn API"""
        logger.info("Starting LinkedIn authentication process")
        
        # Log credential status (without exposing actual values)
        if not linkedin_email or linkedin_email.strip() == "":
            logger.error("LinkedIn email is empty or not set in environment variables")
            return False
            
        if not linkedin_pass or linkedin_pass.strip() == "":
            logger.error("LinkedIn password is empty or not set in environment variables")
            return False
            
        logger.info(f"Credentials loaded - Email length: {len(linkedin_email)}, Password length: {len(linkedin_pass)}")
        logger.info(f"Email format check: {'@' in linkedin_email}")
        
        try:
            logger.info("Attempting to create LinkedIn API instance...")
            self.api = Linkedin(linkedin_email, linkedin_pass)
            
            logger.info("LinkedIn API instance created successfully")
            self.is_authenticated = True
            
            # Test the connection with a simple API call
            try:
                logger.info("Testing authentication with profile info call...")
                profile_info = self.api.get_profile()
                if profile_info:
                    logger.info("Authentication test successful - profile data retrieved")
                else:
                    logger.warning("Authentication test returned empty profile data")
                    
            except Exception as test_e:
                logger.error(f"Authentication test failed: {test_e}")
                # Don't fail completely, sometimes profile call fails but posts work
                
            print("your cred len", len(linkedin_email), len(linkedin_pass))
            print("-> Successfully authenticated with LinkedIn API")
            logger.info("LinkedIn authentication completed successfully")
            return True
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"LinkedIn authentication failed with error: {error_msg}")
            
            # Detailed error analysis
            if "CHALLENGE" in error_msg:
                logger.error("LinkedIn is requesting additional verification (CHALLENGE)")
                logger.error("Possible causes:")
                logger.error("1. Account requires 2FA verification")
                logger.error("2. LinkedIn detected automated access")
                logger.error("3. Account may be temporarily restricted")
                logger.error("4. IP address may be flagged")
                
            elif "FORBIDDEN" in error_msg:
                logger.error("Access forbidden - account may be restricted or credentials invalid")
                
            elif "UNAUTHORIZED" in error_msg:
                logger.error("Invalid credentials provided")
                
            elif "RATE_LIMIT" in error_msg:
                logger.error("Rate limit exceeded - too many requests")
                
            elif "NETWORK" in error_msg or "CONNECTION" in error_msg:
                logger.error("Network connectivity issue")
                
            else:
                logger.error(f"Unknown authentication error: {error_msg}")
                
            print(f"-> Authentication failed: {e}")
            self.is_authenticated = False
            return False
    
    def extract_username_from_url(self, profile_url: str) -> str:
        """Extract username from LinkedIn profile URL"""
        logger.info(f"Extracting username from URL: {profile_url}")
        
        # Handle various LinkedIn URL formats
        patterns = [
            r'linkedin\.com/in/([^/?]+)',
            r'linkedin\.com/pub/([^/?]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, profile_url)
            if match:
                username = match.group(1)
                logger.info(f"Username extracted using pattern '{pattern}': {username}")
                return username
        
        # If no pattern matches, assume the profile_url is already a username
        username = profile_url.strip('/')
        logger.info(f"No URL pattern matched, using input as username: {username}")
        return username
    
    def format_post_data(self, raw_post: Dict, post_index: int) -> Dict:
        """Convert LinkedIn API post data to match the original scraper format exactly"""
        logger.debug(f"Formatting post data for post index: {post_index}")
        
        # Initialize with exact field order and types as original scraper
        post_data = {
            "author_name": "",
            "author_url": "",
            "author_avatar": "",
            "timestamp": "",
            "text": "",
            "hashtags": [],
            "images": [],
            "reactions": "",
            "comments": "",
            "user_liked": False,
            "post_url": "",
            "post_id": f"post_{post_index}"
        }
        
        try:
            # Extract author information
            if 'actor' in raw_post and raw_post['actor']:
                actor = raw_post['actor']
                logger.debug(f"Post {post_index}: Actor data found")
                
                # Author name
                if 'name' in actor and 'text' in actor['name']:
                    post_data["author_name"] = actor['name']['text']
                    logger.debug(f"Post {post_index}: Author name extracted: {post_data['author_name']}")
                
                # Author URL (construct from navigationContext if available)
                if 'navigationContext' in actor and 'actionTarget' in actor['navigationContext']:
                    post_data["author_url"] = actor['navigationContext']['actionTarget']
                    logger.debug(f"Post {post_index}: Author URL extracted")
                
                # Author avatar
                if 'image' in actor and 'attributes' in actor['image']:
                    for attr in actor['image']['attributes']:
                        if attr.get('sourceType') == 'PROFILE_PICTURE' and 'miniProfile' in attr:
                            mini_profile = attr['miniProfile']
                            if 'picture' in mini_profile and 'com.linkedin.common.VectorImage' in mini_profile['picture']:
                                artifacts = mini_profile['picture']['com.linkedin.common.VectorImage'].get('artifacts', [])
                                if artifacts:
                                    # Use the largest available image
                                    largest_artifact = max(artifacts, key=lambda x: x.get('width', 0))
                                    root_url = mini_profile['picture']['com.linkedin.common.VectorImage'].get('rootUrl', '')
                                    if root_url and 'fileIdentifyingUrlPathSegment' in largest_artifact:
                                        post_data["author_avatar"] = root_url + largest_artifact['fileIdentifyingUrlPathSegment']
                                        logger.debug(f"Post {post_index}: Author avatar extracted")
                
                # Timestamp
                if 'subDescription' in actor and 'accessibilityText' in actor['subDescription']:
                    post_data["timestamp"] = actor['subDescription']['accessibilityText']
                    logger.debug(f"Post {post_index}: Timestamp extracted: {post_data['timestamp']}")
            
            # Extract post content
            if 'commentary' in raw_post and 'text' in raw_post['commentary']:
                commentary = raw_post['commentary']['text']
                if isinstance(commentary, dict) and 'text' in commentary:
                    post_data["text"] = commentary['text']
                elif isinstance(commentary, str):
                    post_data["text"] = commentary
                logger.debug(f"Post {post_index}: Text content extracted (length: {len(post_data['text'])})")
            
            # Extract hashtags from text
            if post_data["text"]:
                hashtag_pattern = r'#\w+'
                post_data["hashtags"] = re.findall(hashtag_pattern, post_data["text"])
                if post_data["hashtags"]:
                    logger.debug(f"Post {post_index}: Found {len(post_data['hashtags'])} hashtags")
            
            # Extract images
            if 'content' in raw_post:
                content = raw_post['content']
                if 'com.linkedin.voyager.feed.render.ImageComponent' in content:
                    image_component = content['com.linkedin.voyager.feed.render.ImageComponent']
                    if 'images' in image_component:
                        for img in image_component['images']:
                            if 'attributes' in img:
                                for attr in img['attributes']:
                                    if 'vectorImage' in attr:
                                        vector_img = attr['vectorImage']
                                        if 'artifacts' in vector_img and 'rootUrl' in vector_img:
                                            artifacts = vector_img['artifacts']
                                            root_url = vector_img['rootUrl']
                                            if artifacts:
                                                # Use medium-sized image (800px width if available)
                                                selected_artifact = None
                                                for artifact in artifacts:
                                                    if artifact.get('width') == 800:
                                                        selected_artifact = artifact
                                                        break
                                                if not selected_artifact and artifacts:
                                                    selected_artifact = artifacts[0]  # fallback to first
                                                
                                                if selected_artifact and 'fileIdentifyingUrlPathSegment' in selected_artifact:
                                                    image_url = root_url + selected_artifact['fileIdentifyingUrlPathSegment']
                                                    post_data["images"].append(image_url)
                        
                        if post_data["images"]:
                            logger.debug(f"Post {post_index}: Found {len(post_data['images'])} images")
            
            # Extract social metrics
            if 'socialDetail' in raw_post:
                social_detail = raw_post['socialDetail']
                
                # Reactions - keep original "reactions" format
                if 'totalSocialActivityCounts' in social_detail:
                    counts = social_detail['totalSocialActivityCounts']
                    likes = counts.get('numLikes', 0)
                    if likes > 0:
                        post_data["reactions"] = f"{likes} reactions"
                    
                    # Comments
                    comments = counts.get('numComments', 0)
                    if comments > 0:
                        post_data["comments"] = f"{comments} comments"
                    
                    # User liked status
                    post_data["user_liked"] = counts.get('liked', False)
                    
                    logger.debug(f"Post {post_index}: Social metrics - Likes: {likes}, Comments: {comments}")
            
            # Extract post URL
            if 'socialContent' in raw_post and 'shareUrl' in raw_post['socialContent']:
                post_data["post_url"] = raw_post['socialContent']['shareUrl']
                logger.debug(f"Post {post_index}: Post URL extracted")
            
            # Ensure no None values - replace with empty strings where needed
            for key in ['author_name', 'author_url', 'author_avatar', 'timestamp', 'text', 'reactions', 'comments', 'post_url']:
                if post_data[key] is None:
                    post_data[key] = ""
            
        except Exception as e:
            logger.error(f"Error formatting post {post_index}: {e}")
            print(f"-> Error formatting post {post_index}: {e}")
        
        return post_data
    
    def scrape_profile_activity(self, profile_url: str, max_posts: int = 50) -> List[Dict]:
        """
        Scrape LinkedIn profile posts using the linkedin_api library
        
        Args:
            profile_url: LinkedIn profile URL or username
            max_posts: Maximum number of posts to retrieve
            
        Returns:
            List of formatted post data dictionaries
        """
        logger.info(f"Starting profile activity scraping for: {profile_url}")
        logger.info(f"Max posts requested: {max_posts}")
        
        if not self.is_authenticated:
            logger.warning("Not authenticated, attempting authentication...")
            if not self.authenticate():
                logger.error("Authentication failed, cannot scrape profile activity")
                return []
        
        try:
            # Extract username from URL
            username = self.extract_username_from_url(profile_url)
            logger.info(f"Extracting posts for username: {username}")
            print(f"-> Extracting posts for username: {username}")
            
            # Get profile posts using linkedin_api
            logger.info("Making API call to get_profile_posts...")
            raw_posts = self.api.get_profile_posts(username, post_count=max_posts)
            
            if not raw_posts:
                logger.warning("No posts returned from LinkedIn API")
                print("-> No posts found")
                return []
            
            logger.info(f"LinkedIn API returned {len(raw_posts)} raw posts")
            print(f"-> Found {len(raw_posts)} raw posts")
            
            # Format posts to match original scraper output
            formatted_posts = []
            for idx, raw_post in enumerate(raw_posts, start=1):
                try:
                    logger.debug(f"Processing raw post {idx}")
                    formatted_post = self.format_post_data(raw_post, idx)
                    
                    # Only include posts with meaningful content
                    if formatted_post.get('text') or formatted_post.get('images'):
                        formatted_posts.append(formatted_post)
                        logger.debug(f"Post {idx} added to formatted posts")
                    else:
                        logger.debug(f"Post {idx} skipped - no meaningful content")
                        
                except Exception as e:
                    logger.error(f"Error processing post {idx}: {e}")
                    print(f"-> Error processing post {idx}: {e}")
                    continue
            
            logger.info(f"Successfully formatted {len(formatted_posts)} posts out of {len(raw_posts)} raw posts")
            print(f"-> Successfully formatted {len(formatted_posts)} posts")
            return formatted_posts
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error scraping profile activity: {error_msg}")
            
            # Detailed error analysis for scraping
            if "CHALLENGE" in error_msg:
                logger.error("LinkedIn challenge detected during scraping")
            elif "NOT_FOUND" in error_msg:
                logger.error("Profile not found or not accessible")
            elif "FORBIDDEN" in error_msg:
                logger.error("Access forbidden to profile posts")
            elif "RATE_LIMIT" in error_msg:
                logger.error("Rate limit exceeded during scraping")
            else:
                logger.error(f"Unknown scraping error: {error_msg}")
                
            print(f"-> Error scraping profile activity: {e}")
            return []
    
    def cleanup(self):
        """Cleanup method for compatibility with original scraper interface"""
        logger.info("Cleaning up LinkedIn scraper")
        self.api = None
        self.is_authenticated = False
        print("-> LinkedIn API scraper cleaned up")

    # Legacy method names for compatibility
    async def launch_browser(self):
        """Compatibility method - authenticate instead"""
        logger.info("launch_browser called - redirecting to authenticate")
        return self.authenticate()
    
    async def ensure_login(self):
        """Compatibility method - authenticate instead"""
        logger.info("ensure_login called - redirecting to authenticate")
        return self.authenticate()
    
    async def close_browser(self):
        """Compatibility method - cleanup instead"""
        logger.info("close_browser called - redirecting to cleanup")
        self.cleanup()

if __name__ == "__main__":
    def test_scraper():
        logger.info("Starting scraper test")
        scraper = LinkedInScraper()
        try:
            posts = scraper.scrape_profile_activity("https://www.linkedin.com/in/punit173", max_posts=10)
            logger.info(f"Test completed - Found {len(posts)} posts")
            print(f"Found {len(posts)} posts")
            
            # Print first post as example
            if posts:
                print("\nFirst post example:")
                first_post = posts[0]
                for key, value in first_post.items():
                    print(f"{key}: {value}")
                    
        except Exception as e:
            logger.error(f"Test error: {e}")
            print(f"Test error: {e}")
        finally:
            scraper.cleanup()
    
    test_scraper()