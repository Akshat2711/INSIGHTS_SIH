
import logging
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FirestoreUserManager:
    def __init__(self, db_client):
        self.db = db_client
        self.collection_name = 'users_scrapped_data'
    
    def calculate_total_points(self, user_data: Dict[str, Any]) -> int:
        """Calculate total points from post_to_no data."""
        total_points = 0
        post_to_no = user_data.get('post_to_no', {})
        
        for category, items in post_to_no.items():
            if isinstance(items, list):
                for item in items:
                    points = item.get('points', '0')
                    # Convert points to int, handle string numbers
                    try:
                        total_points += int(points)
                    except (ValueError, TypeError):
                        continue
        
        return total_points
    
    def save_user_data(self, user_id: str, user_data: Dict[str, Any]) -> bool:
        """Save user data to Firestore with calculated total points."""
        try:
            # Calculate total points
            total_points = self.calculate_total_points(user_data)
            
            # Add metadata
            user_data['total_points'] = total_points
            user_data['last_updated'] = firestore.SERVER_TIMESTAMP
            
            # Save to Firestore
            doc_ref = self.db.collection(self.collection_name).document(user_id)
            doc_ref.set(user_data, merge=True)
            
            logger.info(f"User {user_id} saved successfully with {total_points} points")
            return True
            
        except Exception as e:
            logger.error(f"Error saving user {user_id}: {e}")
            return False


    def get_user_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user data from Firestore."""
        try:
            doc_ref = self.db.collection(self.collection_name).document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                # Remove Firestore metadata from response
                if 'last_updated' in data:
                    del data['last_updated']
                return data
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
    
    def get_all_users_sorted(self) -> Dict[str, Any]:
        """Get all users sorted by total_points in descending order."""
        try:
            # Query users ordered by total_points (descending)
            users_ref = self.db.collection(self.collection_name).order_by('total_points', direction=firestore.Query.DESCENDING).limit(10)#to limit how many users we want to fetch
            docs = users_ref.stream()
            
            sorted_users = {}
            for doc in docs:
                user_data = doc.to_dict()
                # Remove Firestore metadata from response
                if 'last_updated' in user_data:
                    del user_data['last_updated']
                sorted_users[doc.id] = user_data
            
            return sorted_users
            
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            return {}
    
    def update_original_scraping(self, user_id: str, scraping_data: List[Dict]) -> bool:
        """Update only the original_scrapping field."""
        try:
            doc_ref = self.db.collection(self.collection_name).document(user_id)
            doc_ref.set({
                'original_scrapping': scraping_data,
                'last_updated': firestore.SERVER_TIMESTAMP
            }, merge=True)
            
            logger.info(f"Original scrapping updated for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating original scrapping for {user_id}: {e}")
            return False
    
    def update_post_to_no(self, user_id: str, post_to_no_data: Dict) -> bool:
        """Update post_to_no and automatically recalculate total points."""
        try:
            # Get existing user data first
            existing_data = self.get_user_data(user_id) or {}
            existing_post_to_no = existing_data.get('post_to_no', {})
            
            # Merge new data with existing data
            # This preserves existing categories while updating/adding new ones
            for category, items in post_to_no_data.items():
                existing_post_to_no[category] = items
            
            # Calculate total points from the COMPLETE merged data
            temp_data = {'post_to_no': existing_post_to_no}
            total_points = self.calculate_total_points(temp_data)
            
            # Update both post_to_no and total_points in one operation
            doc_ref = self.db.collection(self.collection_name).document(user_id)
            doc_ref.set({
                'post_to_no': existing_post_to_no,  # Save complete merged data
                'total_points': total_points,
                'last_updated': firestore.SERVER_TIMESTAMP
            }, merge=True)
            
            logger.info(f"Updated post_to_no and total_points ({total_points}) for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating post_to_no for {user_id}: {e}")
            return False
        

        
    def update_user_roles(self, user_id: str, role_data: dict) -> bool:
        """Update user roles and refresh points if post_to_no exists."""
        try:
            existing_data = self.get_user_data(user_id) or {}
            existing_data['role_of_user'] = role_data
            
            # Force recalc & save
            return self.save_user_data(user_id, existing_data)

        except Exception as e:
            logger.error(f"Error updating user roles for {user_id}: {e}")
            return False
        



    def search_users_by_keyword(self, keyword: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search for users based on keyword occurrence in their scraped data.
        Returns top users sorted by keyword frequency.
        """
        try:
            # Get all users from the collection
            users_ref = self.db.collection(self.collection_name)
            docs = users_ref.stream()
            
            keyword_results = []
            keyword_lower = keyword.lower().strip()
            
            for doc in docs:
                user_data = doc.to_dict()
                user_id = doc.id
                keyword_count = 0
                
                # Search in original_scrapping data
                original_scrapping = user_data.get('original_scrapping', [])
                if isinstance(original_scrapping, list):
                    for item in original_scrapping:
                        if isinstance(item, dict):
                            # Search in all string fields of the scraped item
                            for field_value in item.values():
                                if isinstance(field_value, str):
                                    keyword_count += field_value.lower().count(keyword_lower)
                
                # Search in post_to_no data
                post_to_no = user_data.get('post_to_no', {})
                if isinstance(post_to_no, dict):
                    for category, items in post_to_no.items():
                        if isinstance(items, list):
                            for item in items:
                                if isinstance(item, dict):
                                    for field_value in item.values():
                                        if isinstance(field_value, str):
                                            keyword_count += field_value.lower().count(keyword_lower)
                
                # If keyword found, add to results
                if keyword_count > 0:
                    keyword_results.append({
                        'user_id': user_id,
                        'keyword_count': keyword_count,
                        'total_points': user_data.get('total_points', 0),
                        'name': user_data.get('name', user_id),
                        'user_data': user_data  # Include full user data if needed
                    })
            
            # Sort by keyword count (descending), then by total_points as tiebreaker
            keyword_results.sort(key=lambda x: (x['keyword_count'], x['total_points']), reverse=True)
            
            # Return top results
            return keyword_results[:limit]
            
        except Exception as e:
            logger.error(f"Error searching users by keyword '{keyword}': {e}")
            return []



#to handle saving of github data by user
    def save_github_data(self, user_id: str, github_data: Dict[str, Any]) -> bool:
        """Save GitHub data to user document using LinkedIn user ID."""
        try:
            doc_ref = self.db.collection(self.collection_name).document(user_id)  # user_id is LinkedIn ID
            doc_ref.set({
                'github_data': github_data,
                'last_updated': firestore.SERVER_TIMESTAMP
            }, merge=True)
            
            logger.info(f"GitHub data saved for LinkedIn user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving GitHub data for LinkedIn user {user_id}: {e}")
            return False

    def get_user_github_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's GitHub data from Firestore using LinkedIn user ID."""
        try:
            user_data = self.get_user_data(user_id)  # user_id is LinkedIn ID
            if user_data:
                return user_data.get('github_data')
            return None
            
        except Exception as e:
            logger.error(f"Error getting GitHub data for LinkedIn user {user_id}: {e}")
            return None
        






#to save resume data uploaded by user
    def save_resume_data(self, user_id: str, resume_data: Dict[str, Any]) -> bool:
        """Append resume analysis data to existing user document using LinkedIn user ID."""
        try:
            doc_ref = self.db.collection(self.collection_name).document(user_id)
            
            # Use merge=True to append/update the resume_data field without overwriting other fields
            doc_ref.set({
                'resume_data': resume_data,
                'last_updated': firestore.SERVER_TIMESTAMP
            }, merge=True)  # This ensures existing data is preserved
            
            logger.info(f"Resume data merged with existing data for LinkedIn user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving resume data for LinkedIn user {user_id}: {e}")
            return False

    def get_user_resume_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's resume data from Firestore using LinkedIn user ID."""
        try:
            user_data = self.get_user_data(user_id)
            if user_data:
                return user_data.get('resume_data')
            return None
            
        except Exception as e:
            logger.error(f"Error getting resume data for LinkedIn user {user_id}: {e}")
            return None