from pydantic import BaseModel, Field
from typing import List, Optional


class InternshipItem(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    skills: Optional[List[str]] = None


class MatchingRequest(BaseModel):
    target_role: str
    user_skills: List[str] = Field(default_factory=list)
    resume_text: Optional[str] = None

    # ВАЖНО: сюда AI engineer потом будет подсовывать JSON из парсинга
    internships: Optional[List[InternshipItem]] = None

    top_k: int = 5


class MatchResult(BaseModel):
    id: str
    title: str
    company: str
    url: Optional[str] = None

    match_score: int  # 0-100
    why_match: List[str]
    missing_skills: List[str]


class MatchingResponse(BaseModel):
    results: List[MatchResult]