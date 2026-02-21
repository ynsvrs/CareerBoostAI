from pydantic import BaseModel
from typing import List, Optional

class ResumeReviewRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None

class ResumeReviewResponse(BaseModel):
    score: int
    strengths: List[str]
    issues: List[str]
    improved_bullets: List[str]
    keywords: List[str]
    summary: str