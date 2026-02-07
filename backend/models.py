from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class ProjectBase(BaseModel):
    """Base model for project/experience entries"""
    title: str
    description: str
    technologies: List[str] = []
    date_range: str
    category: Literal["project", "experience", "education", "certification"]
    bullets: List[str] = []


class Project(ProjectBase):
    """Project model with ID"""
    id: str


class ProjectCreate(ProjectBase):
    """Model for creating new projects"""
    pass


class ProjectUpdate(BaseModel):
    """Model for updating projects - all fields optional"""
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    date_range: Optional[str] = None
    category: Optional[Literal["project", "experience", "education", "certification"]] = None
    bullets: Optional[List[str]] = None


class JobDescription(BaseModel):
    """Model for job description input"""
    text: str
    company: Optional[str] = None
    position: Optional[str] = None


class CVGenerateRequest(BaseModel):
    """Request model for CV generation"""
    job_description: JobDescription
    max_items: int = Field(default=5, ge=1, le=10, description="Maximum number of projects/experiences to include")
    custom_instructions: Optional[str] = Field(default=None, description="Additional specific instructions for the AI")


class CVGenerateResponse(BaseModel):
    """Response model for CV generation"""
    latex_content: str
    job_id: str
    generated_at: str
    selected_items: List[str] = []


class CVHistoryItem(BaseModel):
    """Model for CV history entry"""
    job_id: str
    company: Optional[str] = None
    position: Optional[str] = None
    generated_at: str
    file_path: str


class BaselineCVResponse(BaseModel):
    """Response model for baseline CV"""
    content: str
    uploaded_at: Optional[str] = None


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    detail: Optional[str] = None


class PersonalInfo(BaseModel):
    """Personal information model"""
    name: Optional[str] = ""
    title: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    bio: Optional[str] = ""
    website: Optional[str] = ""
    github: Optional[str] = ""
    linkedin: Optional[str] = ""


class SkillCategory(BaseModel):
    """Skill category model"""
    category: str
    items: List[str] = []


class UserData(BaseModel):
    """Complete user data model"""
    personal_info: Optional[PersonalInfo] = None
    education: List[Project] = []
    experience: List[Project] = []
    projects: List[Project] = []
    skills: List[SkillCategory] = []
    certifications: List[Project] = []


class UserDataResponse(BaseModel):
    """Response model for user data"""
    personal_info: Optional[PersonalInfo] = None
    skills: List[SkillCategory] = []
    all_items: List[Project] = []  # Combined education, experience, projects, certifications
