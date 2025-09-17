import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from langchain.schema import HumanMessage
import asyncio

class SRMPlacementScoreUpdater:
    """
    A lightweight class to update scores based on role changes without re-processing posts.
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
        self.update_prompt_template = PromptTemplate.from_template(self._get_update_prompt_template())

    def _load_scoring_matrix(self, filepath: str) -> dict:
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"SRM scoring matrix file not found: {filepath}")
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError as e:
                raise json.JSONDecodeError(f"Failed to parse JSON from {filepath}: {e}", e.doc, e.pos)

    def _get_update_prompt_template(self) -> str:
        return """
        You are an expert assistant helping update achievement scores based on role information changes.

        ### CONTEXT
        You will be given:
        1. Existing scored data (post_to_no format) from previous scoring
        2. Updated role mapping where key is post_id and value is the role described by the student

        ### YOUR TASK
        Update the scores in the existing data based on the new role information. Apply the same role validation rules:

        ### ROLE VALIDATION RULE
        - For each achievement, check if there is a corresponding post_id in the updated `role` mapping.
        - If a **valid and relevant role** is provided, keep the base marks as per the placement matrix.
        - If **no role** is provided, deduct **1 mark** from the base score and update `why` → *"Deducted 1 mark as role was not described in the post"*.
        - If a **role is provided but is irrelevant/unrelated** to the achievement, deduct **1 mark** from the base score and update `why` → *"Role mentioned does not match the achievement, hence 1 mark deducted"*.

        ### RULES
        - Only update the `points` and `why` fields where necessary
        - Keep all other fields (timestamp, source_post_index, source_post_excerpt, reaction, comments) unchanged
        - Do NOT wrap the JSON output inside ```json or any code block fences. Only give pure JSON output.
        - Return the complete updated scored data structure

        ### SCORING METRICS (for reference - only base scores)
        Base scoring rules:
        - Hackathon: 1st=5, 2nd=4, 3rd=3, participated=1
        - Internship: IIT/NIT/SRM=5, Fortune500=4, Small(3+mo)=3, Small(<3mo)=2, Unknown=1, Paid=+1
        - Project: IIT/NIT/DRDO=5, Govt=4, Full-stack/Web/Mobile=3, SRM faculty=3, Mini=1-2
        - Certification: Industrial=5, NPTEL=3, Coursera/edX=2, Programming=1, Udemy=0.5
        - Leadership: President/Team Lead=4, Project Lead=3
        - CGPA: >9.5=5, 9.1-9.5=4, 8.6-9.0=3, 7.5-8.5=2, <7.5=1

        ### EXISTING SCORED DATA
        {existing_scored_data}

        ### UPDATED ROLE DATA
        {updated_roles}
        """

    def update_scores_with_roles(self, existing_scored_data: dict, updated_roles: dict) -> dict:
        """
        Update existing scored data with new role information.
        
        Args:
            existing_scored_data: The current post_to_no data from Firestore
            updated_roles: Dictionary mapping post_id to role descriptions
            
        Returns:
            Updated scored data with recalculated points and why explanations
        """
        prompt_str = self.update_prompt_template.format(
            scoring_metrics=json.dumps(self.scoring_metrics),
            existing_scored_data=json.dumps(existing_scored_data),
            updated_roles=json.dumps(updated_roles)
        )
        
        # Log the final prompt before sending to LLM
        print("=== FINAL PROMPT TO LLM ===")
        print(f"Prompt length: {len(prompt_str)} characters")
        print(f"Prompt content:\n{prompt_str}")
        print("=== END OF PROMPT ===")
        
        messages = [HumanMessage(content=prompt_str)]
        response = self.llm.invoke(messages)
        output_text = response.content
        
        return self._parse_llm_output(output_text)

    def _parse_llm_output(self, output_text: str) -> dict:
        """Parse and clean LLM output."""
        # Clean the output
        if output_text.startswith("```"):
            output_text = output_text.strip("`")
            if output_text.lower().startswith("json"):
                output_text = output_text[4:].strip()
        if output_text.endswith("```"):
            output_text = output_text[:-3].strip()

        try:
            parsed = json.loads(output_text)
            return parsed
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON output: {e}\nOutput was:\n{output_text[:500]}...")
            raise ValueError(f"Failed to parse JSON output from LLM: {e}")


async def update_scores_for_role_changes(username: str, 
                                       updated_roles: dict,
                                       scoring_matrix_file: str,
                                       firestore_manager,
                                       api_key_env: str = "GEMINI_API_KEY") -> dict:
    """
    Update scores for role changes without re-processing all posts.
    
    Args:
        username: Username to update
        updated_roles: New role mapping
        scoring_matrix_file: Path to scoring matrix JSON
        firestore_manager: Firestore manager instance
        api_key_env: Environment variable for API key
        
    Returns:
        Updated scored data
    """
    try:
        # Get existing user data from Firestore
        user_data = firestore_manager.get_user_data(username)
        if not user_data:
            raise ValueError(f"No data found for user '{username}' in Firestore")
        
        # Check if post_to_no data exists
        if "post_to_no" not in user_data or not user_data["post_to_no"]:
            raise ValueError(f"No existing scored data found for user '{username}'. Please run full scoring first.")
        
        existing_scored_data = user_data["post_to_no"]
        
        # Initialize score updater
        updater = SRMPlacementScoreUpdater(scoring_matrix_path=scoring_matrix_file, api_key_env=api_key_env)
        
        # Update scores with new roles
        updated_scored_data = updater.update_scores_with_roles(existing_scored_data, updated_roles)
        
        # Update Firestore with new scored data
        success = firestore_manager.update_post_to_no(username, updated_scored_data)
        if not success:
            raise ValueError(f"Failed to save updated scored data for user '{username}' to Firestore")
        
        return updated_scored_data
        
    except Exception as e:
        print(f"Score update error for {username}: {e}")
        raise


def run_async(coro):
    """Helper function to run async code in sync context"""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)