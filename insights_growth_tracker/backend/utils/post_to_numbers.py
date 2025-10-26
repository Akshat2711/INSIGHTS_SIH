import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from langchain.schema import HumanMessage
import asyncio
import re

#importing neccessary tools
from tools.tools_post_2_no import POST_2_NO_TOOLS



class SRMPlacementScorer:
    """
    A class to score student achievements based on LinkedIn posts using a Large Language Model.
    The scoring is based on a provided SRM placement matrix.
    """

    def __init__(self, scoring_matrix_path: str, api_key_env: str = "GEMINI_API_KEY"):
        load_dotenv()
        self.api_key = os.getenv(api_key_env, "")
        if not self.api_key:
            raise ValueError(f"{api_key_env} not found in environment variables.")

        self.llm = ChatGoogleGenerativeAI(
            model='gemini-2.5-flash',
            temperature=0,
            google_api_key=self.api_key
        )

        self.scoring_metrics = self._load_scoring_matrix(scoring_matrix_path)
        self.prompt_template = PromptTemplate.from_template(self._get_prompt_template())

        #obejct to use necc tools
        self.neccessary_tools=POST_2_NO_TOOLS(self.scoring_metrics)



    def _load_scoring_matrix(self, filepath: str) -> dict:
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"SRM scoring matrix file not found: {filepath}")
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError as e:
                raise json.JSONDecodeError(f"Failed to parse JSON from {filepath}: {e}", e.doc, e.pos)


    def process_firestore(self, user_data: dict) -> dict:
        """Process user data from Firestore format."""
        if "original_scrapping" not in user_data:
            raise ValueError("No original_scrapping data found in user data")
        
        posts = user_data["original_scrapping"]
        scored_data = self.run_scoring(posts)
        return scored_data

    def _get_prompt_template(self) -> str:
        return """
        You are an expert assistant helping automate achievement scoring for student placement evaluations.
    
        ### CONTEXT
        You will be given a list of social media posts by a student (scraped from LinkedIn). These posts contain academic milestones, contests, internships, certifications, and projects.

        ### YOUR TASK
        From this data, extract and return a list of structured entries according to the SRM placement scoring system. Your output must be a JSON object where data is grouped by category (e.g., "hackathon", "internship", "certification", "project", "cgpa", etc.). For each item in a group, include:
        - Specific data like position, type, score range, etc.
        - `points`: according to SRM placement matrix
        - `why`: explain why those points were assigned giving some background based on the matrix rule
        - `source_post_index`: the index (0-based) of the post in the provided input list from which this entry was extracted. If an achievement is merged from multiple posts, provide a list of indices.
        - `source_post_excerpt`: a short excerpt (<=200 characters) or headline from the source post(s) that demonstrates the achievement (if available). Use a list if multiple posts are merged.
        - `timestamp`: the time the post was uploaded
        - `reaction`: number of reactions on the post
        - `comments`: number of comments on the post

        ### DEDUPLICATION RULE
        - If multiple posts describe the **same achievement**, merge them into a single entry. 
        - Do not assign extra points for duplicate posts (enter the first post point). 
        - Instead, combine their metadata (e.g., keep a list of timestamps, total reactions, and total comments) inside that single entry.
        - When merging duplicates, include all `source_post_index` values and all `source_post_excerpt` values that contributed to the merged entry.
    
        ### EXAMPLE OUTPUT FORMAT (partial):
        {{
            "hackathon": [
            {{
                "position": "3",
                "points": "3", 
                "why": "Won 3rd position in Atos Hackathon = 3 marks as per placement matrix",
                "timestamp": ["1 year ago", "10 months ago"],
                "source_post_index": [0, 2],
                "source_post_excerpt": ["Won 3rd place in Atos Hackathon", "Celebrating 3rd place in Atos event"],
                "reaction": 33,
                "comments": 31
            }}
            ],
            "project": [
            {{
                "type": "Web/Mobile App",
                "points": "3",
                "why": "Team project 'FINGINEE' is a web-based AI product = 3 Marks as per placement matrix",
                "timestamp": ["2 months ago"],
                "source_post_index": [5],
                "source_post_excerpt": ["Launched FINGINEE: a web-based AI product"],
                "reaction": 30,
                "comments": 21
            }}
            ]
        }}
    
        ### RULES
        - Do NOT wrap the JSON output inside ```json or any code block fences. Only give pure JSON output.
        - Only include activities that can be mapped to the official scoring metrics.
        - Group similar events under the same key.
        - Merge duplicates across posts into one entry (see deduplication rule).
        - Do not infer anything that is not clearly stated.
        - If the information does not map to any scoring rule, ignore it.
        - You must refer to exact terms from the placement metrics.
            
        ### SCORING METRICS
        {scoring_metrics}
    
        ### INPUT DATA (LinkedIn Posts)
        {user_data}
        """

    def load_post_data_from_firestore(self, user_data: dict) -> list:
        """Load from Firestore data."""
        if "original_scrapping" not in user_data:
            raise ValueError("No original_scrapping data found in user data")
        return user_data["original_scrapping"]

    def run_scoring(self, linkedin_posts: list) -> dict:
        # Clean the data first
        cleaned_posts = self.neccessary_tools._clean_post_data(linkedin_posts)
        
        print(f"Original posts: {len(linkedin_posts)}, Cleaned posts: {len(cleaned_posts)}")
        
        # Check if we need to chunk the data
        if self.neccessary_tools._should_chunk_data(cleaned_posts):
            print("Data is large, processing in chunks...")
            return self._process_in_chunks(cleaned_posts)
        else:
            print("Processing all data in single request...")
            return self._process_single_batch(cleaned_posts)

    def _process_single_batch(self, posts: list) -> dict:
        """Process all posts in a single batch."""
        prompt_str = self.prompt_template.format(
            scoring_metrics=json.dumps(self.scoring_metrics),
            user_data=json.dumps(posts)
        )
        
        messages = [HumanMessage(content=prompt_str)]
        response = self.llm.invoke(messages)
        output_text = response.content
        
        return self._parse_llm_output(output_text)

    def _process_in_chunks(self, posts: list) -> dict:
        """Process posts in chunks and merge results."""
        chunks = self.neccessary_tools._chunk_posts(posts, chunk_size=10)
        print(f"Processing {len(chunks)} chunks...")
        
        chunk_results = []
        
        for i, chunk in enumerate(chunks):
            print(f"Processing chunk {i+1}/{len(chunks)} with {len(chunk)} posts...")
            
            try:
                result = self._process_single_batch(chunk)
                chunk_results.append(result)
            except Exception as e:
                print(f"Error processing chunk {i+1}: {e}")
                chunk_results.append({})  # Add empty result for failed chunk
        
        # Merge all chunk results
        return self.neccessary_tools._merge_scoring_results(chunk_results)

    def _parse_llm_output(self, output_text: str) -> dict:
        """Parse and clean LLM output."""
        # Clean the output
        if output_text.startswith("```"):
            output_text = output_text.strip("`")
            if output_text.lower().startswith("json"):
                output_text = output_text[4:].strip()
        if output_text.endswith("```"):
            output_text = output_text[:-3].strip()
        
        print(f"LLM raw output length: {len(output_text)} characters")

        try:
            parsed = json.loads(output_text)
            return parsed
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON output: {e}\nOutput was:\n{output_text[:500]}...")
            raise ValueError(f"Failed to parse JSON output from LLM: {e}")

    def update_combined_file(self, combined_file: str, username: str, scored_data: dict):
        if os.path.exists(combined_file):
            with open(combined_file, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = {}
        if username not in data:
            data[username] = {}
        if "original_scrapping" not in data[username]:
            data[username]["original_scrapping"] = []
        data[username]["post_to_no"] = scored_data
        with open(combined_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

    def process(self, combined_file: str, username: str) -> dict:
        posts = self.load_post_data_from_combined(combined_file, username)
        scored_data = self.run_scoring(posts)
        self.update_combined_file(combined_file, username, scored_data)
        return scored_data


async def run_scoring_pipeline_firestore(username: str, 
                                 scoring_matrix_file: str,
                                 firestore_manager,
                                 api_key_env: str = "GEMINI_API_KEY") -> dict:
    """Run scoring pipeline with Firestore integration."""
    try:
        # Get user data from Firestore
        user_data = firestore_manager.get_user_data(username)
        if not user_data:
            raise ValueError(f"No data found for user '{username}' in Firestore")
        
        # Initialize scorer and process
        scorer = SRMPlacementScorer(scoring_matrix_path=scoring_matrix_file, api_key_env=api_key_env)
        scored_data = scorer.process_firestore(user_data)
        
        # Update Firestore with scored data
        success = firestore_manager.update_post_to_no(username, scored_data)
        if not success:
            raise ValueError(f"Failed to save scored data for user '{username}' to Firestore")
        
        return scored_data
        
    except Exception as e:
        print(f"Scoring pipeline error for {username}: {e}")
        raise


# CLI usage
if __name__ == "__main__":
    asyncio.run(run_scoring_pipeline_firestore(
            "punit173",
            r"C:\codes\insights_project\backend\ranking_criteria_metrics\placement_ranking.json"
        ))