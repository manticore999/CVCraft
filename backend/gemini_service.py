import os
from google import genai
import json
import hashlib


PROMPT_FILE = os.path.join(os.path.dirname(__file__), "prompts", "cv_generation_prompt.txt")
with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
    PROMPT_TEMPLATE = f.read()

EXTRACTION_PROMPT_FILE = os.path.join(os.path.dirname(__file__), "prompts", "cv_extraction_prompt.txt")
with open(EXTRACTION_PROMPT_FILE, 'r', encoding='utf-8') as f:
    EXTRACTION_PROMPT_TEMPLATE = f.read()


def generate_stable_id(title):
    """Generate consistent ID from title for deduplication"""
    normalized = title.lower().strip()
    return hashlib.md5(normalized.encode()).hexdigest()[:8]


def generate_cv(baseline_cv, projects, job_description, company="", position="", max_items=5, custom_instructions=""):
    """
    Generate a tailored CV using Gemini AI.
    
    Args:
        baseline_cv: Your LaTeX CV template
        projects: List of your projects/experiences
        job_description: The job description text
        company: Company name (optional)
        position: Position title (optional)
        max_items: How many projects to include (default 5)
        custom_instructions: Additional specific instructions (optional)
    
    Returns:
        A dictionary with the tailored CV and selected project IDs
    """
    
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    # Get model name from environment (with default fallback)
    model_name = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")
    
    # Connect to Gemini
    client = genai.Client(api_key=api_key)
    
    # Convert projects to JSON format
    projects_json = json.dumps(
        [p.dict() for p in projects], 
        indent=2, 
        ensure_ascii=False
    )
    
    # Build the full prompt
    company_text = f" at {company}" if company else ""
    position_text = f" for the {position} position" if position else ""
    
    prompt = PROMPT_TEMPLATE.format(
        max_items=max_items,
        baseline_cv=baseline_cv,
        projects_json=projects_json,
        company_info=company_text,
        position_info=position_text,
        job_description_text=job_description
    )
    
    # Append custom instructions if provided
    if custom_instructions and custom_instructions.strip():
        prompt += f"\n\nADDITIONAL SPECIFIC INSTRUCTIONS FROM USER:\n{custom_instructions.strip()}\n\nPlease follow these additional instructions carefully while still maintaining ATS-friendliness and the guidelines above."
    
    # Call Gemini API
    response = client.models.generate_content(
        model=model_name,
        contents=prompt
    )
    
    # Clean up the response (remove markdown code blocks)
    latex_cv = response.text.strip()
    if latex_cv.startswith("```latex"):
        latex_cv = latex_cv[8:]
    elif latex_cv.startswith("```"):
        latex_cv = latex_cv[3:]
    if latex_cv.endswith("```"):
        latex_cv = latex_cv[:-3]
    latex_cv = latex_cv.strip()
    
    # Figure out which projects were used
    selected_project_ids = []
    for project in projects:
        if project.title.lower() in latex_cv.lower():
            selected_project_ids.append(project.id)
    
    return {
        "tailored_cv": latex_cv,
        "selected_item_ids": selected_project_ids
    }


def extract_cv_data(latex_cv):
    """Extract structured data from LaTeX CV using AI"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
    client = genai.Client(api_key=api_key)
    
    prompt = EXTRACTION_PROMPT_TEMPLATE.format(latex_cv=latex_cv)
    response = client.models.generate_content(model=model_name, contents=prompt)
    
    # Clean markdown code blocks
    response_text = response.text.strip()
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    elif response_text.startswith("```"):
        response_text = response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]
    
    extracted_data = json.loads(response_text.strip())
    
    # Add stable IDs and category fields
    category_map = {"projects": "project", "experience": "experience", "education": "education", "certifications": "certification"}
    for category, cat_value in category_map.items():
        if category in extracted_data:
            for item in extracted_data[category]:
                if "title" in item:
                    item["id"] = generate_stable_id(item["title"])
                item["category"] = cat_value
    
    return extracted_data
