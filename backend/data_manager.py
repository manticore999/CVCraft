import json
import os
from pathlib import Path
from typing import List, Optional, Dict
from datetime import datetime
import uuid
import hashlib
from models import Project, ProjectCreate, ProjectUpdate, CVHistoryItem, PersonalInfo, SkillCategory, UserData


def generate_stable_id(title):
    """Generate a stable ID from title for deduplication"""
    normalized = title.lower().strip()
    return hashlib.md5(normalized.encode()).hexdigest()[:8]


class DataManager:
    """Manages local file storage for projects, baseline CV, and generated CVs"""
    
    def __init__(self, data_dir: str = "../data"):
        self.data_dir = Path(data_dir)
        self.projects_file = self.data_dir / "projects.json"
        self.personal_info_file = self.data_dir / "personal_info.json"
        self.skills_file = self.data_dir / "skills.json"
        self.baseline_cv_file = self.data_dir / "baseline_cv.tex"
        self.generated_dir = self.data_dir / "generated"
        self.metadata_file = self.data_dir / "metadata.json"
        
        # Ensure directories exist
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.generated_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize files if they don't exist
        if not self.projects_file.exists():
            self._save_json(self.projects_file, [])
        if not self.personal_info_file.exists():
            self._save_json(self.personal_info_file, {
                "name": "",
                "title": "",
                "email": "",
                "phone": "",
                "location": "",
                "bio": "",
                "website": "",
                "github": "",
                "linkedin": ""
            })
        if not self.skills_file.exists():
            self._save_json(self.skills_file, [])
        if not self.metadata_file.exists():
            self._save_json(self.metadata_file, {
                "baseline_cv_uploaded_at": None,
                "cv_history": []
            })
    
    def _load_json(self, file_path: Path) -> any:
        """Load JSON from file, create with defaults if missing"""
        if not file_path.exists():
            default_data = {
                "projects.json": [],
                "skills.json": [],
                "personal_info.json": {"name": "", "title": "", "email": "", "phone": "", "location": "", "bio": "", "website": "", "github": "", "linkedin": ""},
                "metadata.json": {"baseline_cv_uploaded_at": None, "cv_history": []}
            }
            self._save_json(file_path, default_data.get(file_path.name, {}))
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _save_json(self, file_path: Path, data: any):
        """Save JSON to file"""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    # ===== Baseline CV Operations =====
    
    def save_baseline_cv(self, content: str) -> dict:
        """Save baseline LaTeX CV"""
        with open(self.baseline_cv_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Update metadata
        metadata = self._load_json(self.metadata_file)
        metadata["baseline_cv_uploaded_at"] = datetime.now().isoformat()
        self._save_json(self.metadata_file, metadata)
        
        return {
            "message": "Baseline CV saved successfully",
            "uploaded_at": metadata["baseline_cv_uploaded_at"]
        }
    
    def get_baseline_cv(self) -> Optional[dict]:
        """Get baseline LaTeX CV"""
        if not self.baseline_cv_file.exists():
            return None
        
        with open(self.baseline_cv_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        metadata = self._load_json(self.metadata_file)
        
        return {
            "content": content,
            "uploaded_at": metadata.get("baseline_cv_uploaded_at")
        }
    
    # ===== Projects Operations =====
    
    def get_all_projects(self) -> List[Project]:
        """Get all projects"""
        data = self._load_json(self.projects_file)
        return [Project(**item) for item in data]
    
    def get_project(self, project_id: str) -> Optional[Project]:
        """Get a specific project by ID"""
        projects = self._load_json(self.projects_file)
        for proj in projects:
            if proj["id"] == project_id:
                return Project(**proj)
        return None
    
    def create_project(self, project_data: ProjectCreate) -> Project:
        """Create a new project"""
        projects = self._load_json(self.projects_file)
        
        # Generate stable ID based on title
        new_id = generate_stable_id(project_data.title)
        
        # Check if project with same ID already exists
        for proj in projects:
            if proj["id"] == new_id:
                # Update existing project instead of creating duplicate
                proj.update(project_data.dict())
                self._save_json(self.projects_file, projects)
                return Project(**proj)
        
        # Create new project
        new_project = Project(id=new_id, **project_data.dict())
        
        projects.append(new_project.dict())
        self._save_json(self.projects_file, projects)
        
        return new_project
    
    def update_project(self, project_id: str, project_data: ProjectUpdate) -> Optional[Project]:
        """Update an existing project"""
        projects = self._load_json(self.projects_file)
        
        for i, proj in enumerate(projects):
            if proj["id"] == project_id:
                # Update only provided fields
                update_dict = project_data.dict(exclude_unset=True)
                projects[i].update(update_dict)
                self._save_json(self.projects_file, projects)
                return Project(**projects[i])
        
        return None
    
    def delete_project(self, project_id: str) -> bool:
        """Delete a project"""
        projects = self._load_json(self.projects_file)
        original_length = len(projects)
        
        projects = [p for p in projects if p["id"] != project_id]
        
        if len(projects) < original_length:
            self._save_json(self.projects_file, projects)
            return True
        return False
    
    def import_projects(self, projects_data: List[dict]) -> dict:
        """Import multiple projects from JSON"""
        projects = self._load_json(self.projects_file)
        imported = 0
        
        for proj_dict in projects_data:
            # Generate ID if not present
            if "id" not in proj_dict:
                proj_dict["id"] = str(uuid.uuid4())[:8]
            
            # Check if ID already exists
            if not any(p["id"] == proj_dict["id"] for p in projects):
                try:
                    project = Project(**proj_dict)
                    projects.append(project.dict())
                    imported += 1
                except Exception as e:
                    print(f"Failed to import project: {e}")
        
        self._save_json(self.projects_file, projects)
        return {"message": f"Imported {imported} projects", "count": imported}
    
    # ===== Generated CV Operations =====
    
    def save_generated_cv(self, latex_content: str, job_id: str, company: Optional[str] = None, 
                          position: Optional[str] = None) -> CVHistoryItem:
        """Save a generated CV and update history"""
        filename = f"{job_id}.tex"
        file_path = self.generated_dir / filename
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(latex_content)
        
        # Update history
        metadata = self._load_json(self.metadata_file)
        history_item = CVHistoryItem(
            job_id=job_id,
            company=company,
            position=position,
            generated_at=datetime.now().isoformat(),
            file_path=str(file_path)
        )
        
        metadata["cv_history"].insert(0, history_item.dict())  # Add to beginning
        self._save_json(self.metadata_file, metadata)
        
        return history_item
    
    def get_cv_history(self) -> List[CVHistoryItem]:
        """Get CV generation history"""
        metadata = self._load_json(self.metadata_file)
        return [CVHistoryItem(**item) for item in metadata.get("cv_history", [])]
    
    def get_generated_cv(self, job_id: str) -> Optional[str]:
        """Get a specific generated CV by job ID"""
        file_path = self.generated_dir / f"{job_id}.tex"
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        return None
    
    # ===== Personal Info Operations =====
    
    def get_personal_info(self) -> PersonalInfo:
        """Get personal information"""
        data = self._load_json(self.personal_info_file)
        return PersonalInfo(**data)
    
    def save_personal_info(self, personal_info: PersonalInfo) -> dict:
        """Save personal information"""
        self._save_json(self.personal_info_file, personal_info.dict())
        return {"message": "Personal information saved successfully"}
    
    # ===== Skills Operations =====
    
    def get_skills(self) -> List[SkillCategory]:
        """Get all skills"""
        data = self._load_json(self.skills_file)
        return [SkillCategory(**item) for item in data]
    
    def save_skills(self, skills: List[SkillCategory]) -> dict:
        """Save skills"""
        self._save_json(self.skills_file, [skill.dict() for skill in skills])
        return {"message": "Skills saved successfully"}
    
    # ===== Comprehensive Portfolio Import =====
    
    def import_full_portfolio(self, portfolio_data: Dict) -> dict:
        """Import complete portfolio data with deduplication"""
        imported_counts = {"personal_info": 0, "education": 0, "experience": 0, "projects": 0, "skills": 0, "certifications": 0}
        
        try:
            # Import personal info
            if "personal_info" in portfolio_data and portfolio_data["personal_info"]:
                personal_info = PersonalInfo(**portfolio_data["personal_info"])
                self.save_personal_info(personal_info)
                imported_counts["personal_info"] = 1
            
            # Import skills
            if "skills" in portfolio_data and portfolio_data["skills"]:
                skills = [SkillCategory(**skill) for skill in portfolio_data["skills"]]
                self.save_skills(skills)
                imported_counts["skills"] = len(skills)
            
            # Get existing IDs for deduplication
            existing_projects = self._load_json(self.projects_file)
            existing_ids = {p["id"] for p in existing_projects}
            
            # Category mapping
            category_map = {"education": "education", "experience": "experience", "projects": "project", "certifications": "certification"}
            
            all_items = []
            for category in ["education", "experience", "projects", "certifications"]:
                if category in portfolio_data and portfolio_data[category]:
                    for item in portfolio_data[category]:
                        # Generate stable ID if not present
                        if "id" not in item:
                            item["id"] = generate_stable_id(item["title"]) if "title" in item else str(uuid.uuid4())[:8]
                        
                        # Skip duplicates
                        if item["id"] in existing_ids:
                            continue
                        
                        # Set category
                        item.setdefault("category", category_map[category])
                        
                        try:
                            project = Project(**item)
                            all_items.append(project.dict())
                            imported_counts[category] += 1
                        except Exception as e:
                            print(f"Failed to import {category} item: {e}")
            
            existing_projects.extend(all_items)
            self._save_json(self.projects_file, existing_projects)
            
            return {"message": "Portfolio imported successfully", "counts": imported_counts, "total_items": sum(imported_counts.values())}
            
        except Exception as e:
            raise Exception(f"Failed to import portfolio: {str(e)}")
