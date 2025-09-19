import os
import sys
from dotenv import load_dotenv
from linkedin_api import Linkedin
from typing import List, Dict, Optional
import re

load_dotenv()

linkedin_pass = os.getenv("Linkedin_pass", " ")
linkedin_email = os.getenv("Linkedin_email", " ")

class LinkedInScraper:
    def __init__(self):
        self.api = None
        self.is_authenticated = False
    
    def authenticate(self) -> bool:
        """Authenticate with LinkedIn API"""
        try:
            self.api = Linkedin(linkedin_email, linkedin_pass)
            self.is_authenticated = True
            print("-> Successfully authenticated with LinkedIn API")
            return True
        except Exception as e:
            print(f"-> Authentication failed: {e}")
            self.is_authenticated = False
            return False
    
    def extract_username_from_url(self, profile_url: str) -> str:
        """Extract username from LinkedIn profile URL"""
        # Handle various LinkedIn URL formats
        patterns = [
            r'linkedin\.com/in/([^/?]+)',
            r'linkedin\.com/pub/([^/?]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, profile_url)
            if match:
                return match.group(1)
        
        # If no pattern matches, assume the profile_url is already a username
        return profile_url.strip('/')
    
    def format_post_data(self, raw_post: Dict, post_index: int) -> Dict:
        """Convert LinkedIn API post data to match the original scraper format exactly"""
        
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
                
                # Author name
                if 'name' in actor and 'text' in actor['name']:
                    post_data["author_name"] = actor['name']['text']
                
                # Author URL (construct from navigationContext if available)
                if 'navigationContext' in actor and 'actionTarget' in actor['navigationContext']:
                    post_data["author_url"] = actor['navigationContext']['actionTarget']
                
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
                
                # Timestamp
                if 'subDescription' in actor and 'accessibilityText' in actor['subDescription']:
                    post_data["timestamp"] = actor['subDescription']['accessibilityText']
            
            # Extract post content
            if 'commentary' in raw_post and 'text' in raw_post['commentary']:
                commentary = raw_post['commentary']['text']
                if isinstance(commentary, dict) and 'text' in commentary:
                    post_data["text"] = commentary['text']
                elif isinstance(commentary, str):
                    post_data["text"] = commentary
            
            # Extract hashtags from text
            if post_data["text"]:
                hashtag_pattern = r'#\w+'
                post_data["hashtags"] = re.findall(hashtag_pattern, post_data["text"])
            
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
            
            # Extract post URL
            if 'socialContent' in raw_post and 'shareUrl' in raw_post['socialContent']:
                post_data["post_url"] = raw_post['socialContent']['shareUrl']
            
            # Ensure no None values - replace with empty strings where needed
            for key in ['author_name', 'author_url', 'author_avatar', 'timestamp', 'text', 'reactions', 'comments', 'post_url']:
                if post_data[key] is None:
                    post_data[key] = ""
            
        except Exception as e:
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
        if not self.is_authenticated:
            if not self.authenticate():
                return []
        
        try:
            # Extract username from URL
            username = self.extract_username_from_url(profile_url)
            print(f"-> Extracting posts for username: {username}")
            
            # Get profile posts using linkedin_api
            raw_posts = self.api.get_profile_posts(username, post_count=max_posts)
            
            if not raw_posts:
                print("-> No posts found")
                return []
            
            print(f"-> Found {len(raw_posts)} raw posts")
            
            # Format posts to match original scraper output
            formatted_posts = []
            for idx, raw_post in enumerate(raw_posts, start=1):
                try:
                    formatted_post = self.format_post_data(raw_post, idx)
                    # Only include posts with meaningful content
                    if formatted_post.get('text') or formatted_post.get('images'):
                        formatted_posts.append(formatted_post)
                except Exception as e:
                    print(f"-> Error processing post {idx}: {e}")
                    continue
            
            print(f"-> Successfully formatted {len(formatted_posts)} posts")
            return formatted_posts
            
        except Exception as e:
            print(f"-> Error scraping profile activity: {e}")
            return []
    
    def cleanup(self):
        """Cleanup method for compatibility with original scraper interface"""
        self.api = None
        self.is_authenticated = False
        print("-> LinkedIn API scraper cleaned up")

    # Legacy method names for compatibility
    async def launch_browser(self):
        """Compatibility method - authenticate instead"""
        return self.authenticate()
    
    async def ensure_login(self):
        """Compatibility method - authenticate instead"""
        return self.authenticate()
    
    async def close_browser(self):
        """Compatibility method - cleanup instead"""
        self.cleanup()

if __name__ == "__main__":
    def test_scraper():
        scraper = LinkedInScraper()
        try:
            posts = scraper.scrape_profile_activity("https://www.linkedin.com/in/punit173", max_posts=10)
            print(f"Found {len(posts)} posts")
            
            # Print first post as example
            if posts:
                print("\nFirst post example:")
                first_post = posts[0]
                for key, value in first_post.items():
                    print(f"{key}: {value}")
                    
        except Exception as e:
            print(f"Test error: {e}")
        finally:
            scraper.cleanup()
    
    test_scraper()