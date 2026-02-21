from fastapi import APIRouter, HTTPException
from app.schemas.matching import MatchingRequest
from app.services.matching import recommend_internships

router = APIRouter(prefix="/api/jobs", tags=["matching"])


@router.post("/match")
def match_jobs(payload: MatchingRequest):
    try:
        result = recommend_internships(
            target_role=payload.target_role,
            user_skills=payload.user_skills,
            resume_text=payload.resume_text,
            internships=payload.internships,
            top_k=payload.top_k or 10,
        )

        jobs = []

        # Safe iteration ⭐
        if result and result.results:
            for r in result.results:
                jobs.append({
                    "name": r.title or "",
                    "company": r.company or "",
                    "url": r.url or None,
                    "match": {
                        "match_percentage": int(r.match_score or 0),
                        "reason": " • ".join(r.why_match[:3]) if r.why_match else "",
                        "missing_skills": r.missing_skills[:5] if r.missing_skills else []
                    }
                })

        return {"jobs": jobs}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Matching failed: {str(e)}"
        )