import re
import json

class POST_2_NO_TOOLS:

    def __init__(self,scoring_metrics):
        self.scoring_metrics=scoring_metrics

    def _clean_post_data(self, posts: list) -> list:
        """
        Remove unnecessary fields from posts to reduce token usage.
        Keep only essential fields needed for scoring.
        """
        essential_fields = {
            'text', 'timestamp', 'post_id', 'reactions', 'comments'
        }
        
        cleaned_posts = []
        for post in posts:
            cleaned_post = {}
            for field in essential_fields:
                if field in post:
                    if field == 'reactions':
                        # Extract just the number from "175 reactions"
                        cleaned_post[field] = self._extract_number(post[field])
                    elif field == 'comments':
                        # Extract just the number from "6 comments" or handle None
                        cleaned_post[field] = self._extract_number(post[field]) if post[field] else 0
                    elif field == 'text':
                        # Clean and truncate text if too long
                        cleaned_post[field] = self._clean_text(post[field])
                    else:
                        cleaned_post[field] = post[field]
            cleaned_posts.append(cleaned_post)
        
        return cleaned_posts

    def _extract_number(self, text: str) -> int:
        """Extract number from strings like '175 reactions' or '6 comments'"""
        if not text:
            return 0
        match = re.search(r'\d+', str(text))
        return int(match.group()) if match else 0

    def _clean_text(self, text: str, max_length: int = 1000) -> str:
        """
        Clean post text by removing URLs, excessive whitespace, and truncating if too long.
        """
        if not text:
            return ""
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove excessive whitespace and newlines
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove hashtag markers (keep the text)
        text = re.sub(r'hashtag\s*#', '#', text)
        
        # Truncate if too long
        if len(text) > max_length:
            text = text[:max_length] + "..."
        
        return text

    def _estimate_token_count(self, text: str) -> int:
        """Rough estimation of token count (1 token ≈ 4 characters)"""
        return len(text) // 4

    def _should_chunk_data(self, posts: list, max_tokens: int = 10000) -> bool:
        """
        Determine if data should be chunked based on estimated token count.
        """
        # Estimate tokens for posts and scoring metrics
        posts_text = json.dumps(posts)
        scoring_text = json.dumps(self.scoring_metrics)
        
        total_tokens = (
            self._estimate_token_count(posts_text) + 
            self._estimate_token_count(scoring_text) +
            2000  # Buffer for prompt template
        )
        
        return total_tokens > max_tokens

    def _chunk_posts(self, posts: list, chunk_size: int = 10) -> list:
        """Split posts into smaller chunks for processing."""
        chunks = []
        for i in range(0, len(posts), chunk_size):
            chunks.append(posts[i:i + chunk_size])
        return chunks

    def _merge_scoring_results(self, results: list) -> dict:
        """
        Merge results from multiple chunks, handling duplicates and adjusting indices.
        CRITICAL: Ensures no double-counting of points for same achievements.
        """
        merged_result = {}
        processed_achievements = {}  # Track processed achievements to prevent double points
        
        for chunk_idx, result in enumerate(results):
            chunk_offset = chunk_idx * 10  # Assuming chunk_size = 10
            
            for category, items in result.items():
                if category not in merged_result:
                    merged_result[category] = []
                    processed_achievements[category] = []
                
                for item in items:
                    # Adjust source_post_index for chunking offset
                    if isinstance(item.get('source_post_index'), list):
                        item['source_post_index'] = [idx + chunk_offset for idx in item['source_post_index']]
                    elif isinstance(item.get('source_post_index'), int):
                        item['source_post_index'] = item['source_post_index'] + chunk_offset
                    
                    # Create achievement signature for tracking
                    achievement_signature = self._create_achievement_signature(item)
                    
                    # Check for duplicates before adding
                    duplicate_found = False
                    for idx, existing_item in enumerate(merged_result[category]):
                        if self._are_duplicate_achievements(existing_item, item):
                            print(f"DUPLICATE DETECTED in {category}: Merging achievement")
                            print(f"  Existing: {existing_item.get('source_post_excerpt', '')[:100]}")
                            print(f"  New: {item.get('source_post_excerpt', '')[:100]}")
                            
                            # Merge WITHOUT adding extra points
                            self._merge_duplicate_achievements(existing_item, item)
                            duplicate_found = True
                            break
                    
                    if not duplicate_found:
                        # Check against processed signatures
                        if achievement_signature not in processed_achievements[category]:
                            merged_result[category].append(item)
                            processed_achievements[category].append(achievement_signature)
                            print(f"NEW ACHIEVEMENT in {category}: {item.get('points', 0)} points")
                        else:
                            print(f"SIGNATURE MATCH FOUND in {category}: Skipping to prevent double points")
        
        return merged_result

    def _create_achievement_signature(self, item: dict) -> str:
        """
        Create a unique signature for an achievement to prevent duplicates.
        """
        excerpt = str(item.get('source_post_excerpt', '')).lower().strip()
        points = str(item.get('points', ''))
        achievement_type = str(item.get('type', '') or item.get('position', '') or item.get('range', '')).lower()
        
        # Remove common variations that might differ between posts
        import re
        excerpt_clean = re.sub(r'[^\w\s]', '', excerpt)  # Remove punctuation
        excerpt_clean = re.sub(r'\s+', ' ', excerpt_clean).strip()  # Normalize whitespace
        
        # Create signature from key components
        signature_parts = []
        if excerpt_clean:
            signature_parts.append(excerpt_clean[:50])  # First 50 chars of excerpt
        if achievement_type:
            signature_parts.append(achievement_type)
        if points:
            signature_parts.append(f"pts:{points}")
        
        return "|".join(signature_parts)

    def _are_duplicate_achievements(self, item1: dict, item2: dict) -> bool:
        """
        Check if two achievements are duplicates based on their content.
        Uses multiple heuristics to detect duplicates more accurately.
        """
        # Get excerpts and normalize them
        excerpt1 = str(item1.get('source_post_excerpt', '')).lower().strip()
        excerpt2 = str(item2.get('source_post_excerpt', '')).lower().strip()
        
        if not excerpt1 or not excerpt2:
            return False
        
        # Method 1: Exact match after normalization
        if excerpt1 == excerpt2:
            return True
        
        # Method 2: One contains the other (with minimum length check)
        if len(excerpt1) > 20 and len(excerpt2) > 20:
            if excerpt1 in excerpt2 or excerpt2 in excerpt1:
                return True
        
        # Method 3: Check for same achievement type and key identifiers
        if self._same_achievement_type(item1, item2):
            # For hackathons: check event name and position
            if self._same_hackathon(excerpt1, excerpt2):
                return True
            
            # For projects: check project name
            if self._same_project(excerpt1, excerpt2):
                return True
            
            # For internships: check company name
            if self._same_internship(excerpt1, excerpt2):
                return True
            
            # For certifications: check course/certification name
            if self._same_certification(excerpt1, excerpt2):
                return True
        
        # Method 4: High word overlap (for similar descriptions)
        if self._high_word_overlap(excerpt1, excerpt2, threshold=0.7):
            return True
        
        return False

    def _same_achievement_type(self, item1: dict, item2: dict) -> bool:
        """Check if both items are of the same achievement category."""
        # This would need to be called from merge function with category info
        # For now, we'll rely on other methods
        return True

    def _same_hackathon(self, text1: str, text2: str) -> bool:
        """Detect same hackathon based on event names and positions."""
        hackathon_indicators = ['hackathon', 'hack', 'coding competition', 'programming contest']
        
        # Check if both are hackathon-related
        is_hack1 = any(indicator in text1 for indicator in hackathon_indicators)
        is_hack2 = any(indicator in text2 for indicator in hackathon_indicators)
        
        if not (is_hack1 and is_hack2):
            return False
        
        # Extract potential event names (words after common patterns)
        import re
        patterns = [
            r'(?:in|at|for)\s+([a-z0-9\s]+?)(?:\s+(?:hackathon|hack|competition))',
            r'([a-z0-9\s]+?)(?:\s+(?:hackathon|hack|competition))',
        ]
        
        events1 = []
        events2 = []
        
        for pattern in patterns:
            events1.extend(re.findall(pattern, text1))
            events2.extend(re.findall(pattern, text2))
        
        # Check for common event names
        for event1 in events1:
            for event2 in events2:
                if event1.strip() and event2.strip():
                    if event1.strip() in event2.strip() or event2.strip() in event1.strip():
                        return True
        
        return False

    def _same_project(self, text1: str, text2: str) -> bool:
        """Detect same project based on project names."""
        project_indicators = ['project', 'built', 'developed', 'created', 'launched']
        
        # Check if both are project-related
        is_project1 = any(indicator in text1 for indicator in project_indicators)
        is_project2 = any(indicator in text2 for indicator in project_indicators)
        
        if not (is_project1 and is_project2):
            return False
        
        # Look for quoted project names or capitalized words (likely project names)
        import re
        # Match quoted strings or capitalized words
        project_names1 = re.findall(r'[\'"]([^\'\"]+)[\'"]|([A-Z][a-zA-Z0-9]+(?:[A-Z][a-zA-Z0-9]*)*)', text1)
        project_names2 = re.findall(r'[\'"]([^\'\"]+)[\'"]|([A-Z][a-zA-Z0-9]+(?:[A-Z][a-zA-Z0-9]*)*)', text2)
        
        # Flatten tuples and filter empty strings
        names1 = [name for group in project_names1 for name in group if name]
        names2 = [name for group in project_names2 for name in group if name]
        
        # Check for common project names
        for name1 in names1:
            for name2 in names2:
                if len(name1) > 2 and len(name2) > 2:
                    if name1.lower() == name2.lower():
                        return True
        
        return False

    def _same_internship(self, text1: str, text2: str) -> bool:
        """Detect same internship based on company names."""
        internship_indicators = ['intern', 'internship', 'trainee', 'apprentice']
        
        # Check if both are internship-related
        is_intern1 = any(indicator in text1 for indicator in internship_indicators)
        is_intern2 = any(indicator in text2 for indicator in internship_indicators)
        
        if not (is_intern1 and is_intern2):
            return False
        
        # Look for company names (words after "at", "with", etc.)
        import re
        company_patterns = [
            r'(?:at|with|for|@)\s+([A-Z][a-zA-Z0-9\s&]+?)(?:\s+(?:as|in|$))',
            r'([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]*)*)\s+(?:intern|internship)'
        ]
        
        companies1 = []
        companies2 = []
        
        for pattern in company_patterns:
            companies1.extend(re.findall(pattern, text1))
            companies2.extend(re.findall(pattern, text2))
        
        # Check for common company names
        for comp1 in companies1:
            for comp2 in companies2:
                if comp1.strip() and comp2.strip():
                    comp1_clean = comp1.strip().lower()
                    comp2_clean = comp2.strip().lower()
                    if comp1_clean == comp2_clean or comp1_clean in comp2_clean or comp2_clean in comp1_clean:
                        return True
        
        return False

    def _same_certification(self, text1: str, text2: str) -> bool:
        """Detect same certification based on course/cert names."""
        cert_indicators = ['certificate', 'certification', 'certified', 'course', 'completed']
        
        # Check if both are certification-related
        is_cert1 = any(indicator in text1 for indicator in cert_indicators)
        is_cert2 = any(indicator in text2 for indicator in cert_indicators)
        
        if not (is_cert1 and is_cert2):
            return False
        
        # Look for certification names
        import re
        cert_patterns = [
            r'(?:completed|finished|earned)\s+([^.!?]+?)(?:\s+(?:certificate|certification|course))',
            r'([^.!?]+?)\s+(?:certificate|certification|course)'
        ]
        
        certs1 = []
        certs2 = []
        
        for pattern in cert_patterns:
            certs1.extend(re.findall(pattern, text1))
            certs2.extend(re.findall(pattern, text2))
        
        # Check for common certification names
        for cert1 in certs1:
            for cert2 in certs2:
                if cert1.strip() and cert2.strip():
                    cert1_clean = cert1.strip().lower()
                    cert2_clean = cert2.strip().lower()
                    if len(cert1_clean) > 5 and len(cert2_clean) > 5:
                        if cert1_clean == cert2_clean or self._high_word_overlap(cert1_clean, cert2_clean, 0.8):
                            return True
        
        return False

    def _high_word_overlap(self, text1: str, text2: str, threshold: float = 0.7) -> bool:
        """Check if two texts have high word overlap."""
        if not text1 or not text2:
            return False
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were'}
        
        words1 = set(word.strip().lower() for word in text1.split() if word.strip().lower() not in stop_words and len(word.strip()) > 2)
        words2 = set(word.strip().lower() for word in text2.split() if word.strip().lower() not in stop_words and len(word.strip()) > 2)
        
        if not words1 or not words2:
            return False
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        # Calculate Jaccard similarity
        similarity = len(intersection) / len(union) if union else 0
        
        return similarity >= threshold

    def _merge_duplicate_achievements(self, existing: dict, new: dict):
        """
        Merge new achievement data into existing achievement WITHOUT adding extra points.
        CRITICAL: Only combines metadata, preserves original points.
        """
        print(f"  MERGING: Keeping points = {existing.get('points', 0)} (not adding {new.get('points', 0)})")
        
        # IMPORTANT: DO NOT add points - keep existing points only
        original_points = existing.get('points', 0)
        
        # Merge source_post_index
        existing_indices = existing.get('source_post_index', [])
        new_indices = new.get('source_post_index', [])
        
        if isinstance(existing_indices, int):
            existing_indices = [existing_indices]
        if isinstance(new_indices, int):
            new_indices = [new_indices]
        
        existing['source_post_index'] = list(set(existing_indices + new_indices))
        
        # Merge source_post_excerpt
        existing_excerpts = existing.get('source_post_excerpt', [])
        new_excerpts = new.get('source_post_excerpt', [])
        
        if isinstance(existing_excerpts, str):
            existing_excerpts = [existing_excerpts]
        if isinstance(new_excerpts, str):
            new_excerpts = [new_excerpts]
        
        # Combine excerpts (remove duplicates)
        all_excerpts = existing_excerpts + new_excerpts
        unique_excerpts = []
        for excerpt in all_excerpts:
            if excerpt and excerpt not in unique_excerpts:
                unique_excerpts.append(excerpt)
        
        existing['source_post_excerpt'] = unique_excerpts
        
        # Merge timestamps
        existing_timestamps = existing.get('timestamp', [])
        new_timestamps = new.get('timestamp', [])
        
        if isinstance(existing_timestamps, str):
            existing_timestamps = [existing_timestamps]
        if isinstance(new_timestamps, str):
            new_timestamps = [new_timestamps]
        
        existing['timestamp'] = list(set(existing_timestamps + new_timestamps))
        
        # Add reactions and comments (these can be summed)
        existing['reactions'] = existing.get('reactions', 0) + new.get('reactions', 0)
        existing['comments'] = existing.get('comments', 0) + new.get('comments', 0)
        
        # Update 'why' field to reflect merging
        existing_why = existing.get('why', '')
        new_why = new.get('why', '')
        
        if existing_why and new_why and existing_why != new_why:
            existing['why'] = f"{existing_why}. [MERGED: Additional mention from another post]"
        
        # ENSURE points remain unchanged
        existing['points'] = original_points
        
        print(f"  MERGED RESULT: {len(existing['source_post_index'])} posts, {existing.get('reactions', 0)} reactions, {existing['points']} points")