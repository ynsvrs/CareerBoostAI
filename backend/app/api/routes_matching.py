from fastapi import APIRouter, HTTPException
from app.schemas.matching import MatchingRequest, MatchingResponse
from app.services.matching import recommend_internships

router = APIRouter(prefix="/api/matching", tags=["matching"])


@router.post("/internships", response_model=MatchingResponse)
def match_internships(payload: MatchingRequest):
    try:
        return recommend_internships(
            target_role=payload.target_role,
            user_skills=payload.user_skills,
            resume_text=payload.resume_text,
            internships=payload.internships,
            top_k=payload.top_k,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {type(e).__name__}")