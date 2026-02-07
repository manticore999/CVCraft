from fastapi import FastAPI, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

from models import (
    Project, ProjectCreate, ProjectUpdate, 
    JobDescription, CVGenerateRequest, CVGenerateResponse,
    CVHistoryItem, BaselineCVResponse, MessageResponse,
    PersonalInfo, SkillCategory, UserData
)
from data_manager import DataManager
from gemini_service import generate_cv, extract_cv_data

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="CVCraft API",
    description="AI-powered LaTeX CV tailoring using Google Gemini",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data manager
data_manager = DataManager()


# ===== Root Endpoint =====

@app.get("/")
def read_root():
    """Root endpoint with API information"""
    return {
        "message": "CVCraft API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    api_key = os.getenv("GEMINI_API_KEY")
    return {
        "status": "healthy",
        "gemini_configured": bool(api_key)
    }


# ===== Baseline CV Endpoints =====

@app.post("/api/cv/baseline", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def upload_baseline_cv(file: UploadFile = File(...)):
    """Upload baseline LaTeX CV template and extract data"""
    
    # Validate file type
    if not file.filename.endswith('.tex'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .tex files are allowed"
        )
    
    # Read file content
    content = await file.read()
    latex_content = content.decode('utf-8')
    
    # Save baseline CV
    result = data_manager.save_baseline_cv(latex_content)
    
    # Extract and save structured data from CV
    try:
        extracted = extract_cv_data(latex_content)
        
        # Import the extracted data using existing import logic
        data_manager.import_full_portfolio(extracted)
        
        return MessageResponse(
            message=f"{result['message']} and extracted data saved",
            detail=f"Uploaded at {result['uploaded_at']}"
        )
    except Exception as e:
        # If extraction fails, still return success for CV upload
        return MessageResponse(
            message=result["message"],
            detail=f"Uploaded at {result['uploaded_at']} (extraction failed: {str(e)})"
        )



@app.get("/api/cv/baseline", response_model=BaselineCVResponse)
def get_baseline_cv():
    """Get the current baseline LaTeX CV"""
    
    result = data_manager.get_baseline_cv()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No baseline CV found. Please upload one first."
        )
    
    return BaselineCVResponse(**result)


# ===== Projects Endpoints =====

@app.get("/api/projects", response_model=List[Project])
def get_projects():
    """Get all projects and experiences"""
    return data_manager.get_all_projects()


@app.get("/api/projects/{project_id}", response_model=Project)
def get_project(project_id: str):
    """Get a specific project by ID"""
    project = data_manager.get_project(project_id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    return project


@app.post("/api/projects", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate):
    """Create a new project or experience"""
    return data_manager.create_project(project)


@app.put("/api/projects/{project_id}", response_model=Project)
def update_project(project_id: str, project_data: ProjectUpdate):
    """Update an existing project"""
    updated_project = data_manager.update_project(project_id, project_data)
    
    if not updated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    return updated_project


@app.delete("/api/projects/{project_id}", response_model=MessageResponse)
def delete_project(project_id: str):
    """Delete a project"""
    success = data_manager.delete_project(project_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    return MessageResponse(message=f"Project {project_id} deleted successfully")


@app.post("/api/projects/import", response_model=MessageResponse)
async def import_projects(file: UploadFile = File(...)):
    """Import projects from a JSON file"""
    
    
    if not file.filename.endswith('.json'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .json files are allowed"
        )
    
    try:
        
        content = await file.read()
        import json
        projects_data = json.loads(content.decode('utf-8'))
        
        if not isinstance(projects_data, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JSON file must contain an array of projects"
            )
        
        # Import projects
        result = data_manager.import_projects(projects_data)
        
        return MessageResponse(
            message=result["message"],
            detail=f"Successfully imported {result['count']} projects"
        )
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON file"
        )


@app.post("/api/portfolio/import", response_model=MessageResponse)
async def import_full_portfolio(file: UploadFile = File(...)):
    """Import complete portfolio (personal info, experience, projects, skills, etc.)"""
    
    # Validate file type
    if not file.filename.endswith('.json'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .json files are allowed"
        )
    
    try:
        # Read and parse JSON
        content = await file.read()
        import json
        portfolio_data = json.loads(content.decode('utf-8'))
        
        if not isinstance(portfolio_data, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JSON file must contain a portfolio object"
            )
        
        # Import portfolio
        result = data_manager.import_full_portfolio(portfolio_data)
        
        return MessageResponse(
            message=result["message"],
            detail=f"Imported {result['total_items']} total items: {result['counts']}"
        )
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON file"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ===== Personal Info Endpoints =====

@app.get("/api/personal-info", response_model=PersonalInfo)
def get_personal_info():
    """Get personal information"""
    return data_manager.get_personal_info()


@app.post("/api/personal-info", response_model=MessageResponse)
def save_personal_info(personal_info: PersonalInfo):
    """Save personal information"""
    result = data_manager.save_personal_info(personal_info)
    return MessageResponse(message=result["message"])


# ===== Skills Endpoints =====

@app.get("/api/skills", response_model=List[SkillCategory])
def get_skills():
    """Get all skills"""
    return data_manager.get_skills()


@app.post("/api/skills", response_model=MessageResponse)
def save_skills(skills: List[SkillCategory]):
    """Save skills"""
    result = data_manager.save_skills(skills)
    return MessageResponse(message=result["message"])


# ===== CV Generation Endpoints =====

@app.post("/api/cv/generate", response_model=CVGenerateResponse)
def generate_cv_endpoint(request: CVGenerateRequest):
    """Generate a tailored CV for a specific job description"""
    
    # Check if API key is configured
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API service not configured. Please set GEMINI_API_KEY in .env file"
        )
    
    # Get baseline CV
    baseline_result = data_manager.get_baseline_cv()
    if not baseline_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No baseline CV found. Please upload a baseline CV first."
        )
    
    # Get all projects
    projects = data_manager.get_all_projects()
    if not projects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No projects found. Please add some projects first."
        )
    
    try:
        # Generate tailored CV using Gemini
        result = generate_cv(
            baseline_cv=baseline_result["content"],
            projects=projects,
            job_description=request.job_description.text,
            company=request.job_description.company or "",
            position=request.job_description.position or "",
            max_items=request.max_items,
            custom_instructions=request.custom_instructions or ""
        )
        
        # Generate job ID
        job_id = str(uuid.uuid4())[:8]
        
        # Save generated CV
        data_manager.save_generated_cv(
            latex_content=result["tailored_cv"],
            job_id=job_id,
            company=request.job_description.company,
            position=request.job_description.position
        )
        
        return CVGenerateResponse(
            latex_content=result["tailored_cv"],
            job_id=job_id,
            generated_at=datetime.now().isoformat(),
            selected_items=result["selected_item_ids"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate CV: {str(e)}"
        )


@app.get("/api/cv/history", response_model=List[CVHistoryItem])
def get_cv_history():
    """Get history of generated CVs"""
    return data_manager.get_cv_history()


@app.get("/api/cv/generated/{job_id}")
def download_generated_cv(job_id: str):
    """Download a specific generated CV"""
    
    content = data_manager.get_generated_cv(job_id)
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Generated CV with job ID {job_id} not found"
        )
    
    # Return as file download
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.tex', delete=False, encoding='utf-8') as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    
    return FileResponse(
        path=tmp_path,
        filename=f"cv_{job_id}.tex",
        media_type="application/x-tex"
    )


@app.get("/api/cv/generated/{job_id}/content")
def get_generated_cv_content(job_id: str):
    """Get the content of a specific generated CV for preview"""
    
    content = data_manager.get_generated_cv(job_id)
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Generated CV with job ID {job_id} not found"
        )
    
    return {"content": content, "job_id": job_id}


# ===== Run the application =====

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True
    )
