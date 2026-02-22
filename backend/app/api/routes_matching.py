from fastapi import APIRouter, HTTPException
from app.schemas.matching import MatchingRequest
from app.services.matching import recommend_internships

router = APIRouter(prefix="/api/jobs", tags=["matching"])


@router.post("/match")
def match_jobs(payload: MatchingRequest):
    try:
        # Вызываем сервис подбора
        result = recommend_internships(
            target_role=payload.target_role,
            user_skills=payload.user_skills,
            resume_text=payload.resume_text,
            internships=payload.internships,
            top_k=payload.top_k or 10,
        )

        jobs = []

        # Универсальная проверка результата ⭐
        # Пытаемся достать список результатов, будь то объект или словарь
        results_list = []
        if hasattr(result, "results"):
            results_list = result.results
        elif isinstance(result, dict):
            results_list = result.get("results", [])

        if results_list:
            for r in results_list:
                # Безопасно достаем данные (и для объектов, и для диктов)
                def get_val(obj, attr, default=""):
                    return getattr(obj, attr, default) if not isinstance(obj, dict) else obj.get(attr, default)

                title = get_val(r, "title") or get_val(r, "name")
                company = get_val(r, "company")
                url = get_val(r, "url", None)
                score = get_val(r, "match_score", 0)
                why = get_val(r, "why_match", [])
                missing = get_val(r, "missing_skills", [])

                jobs.append({
                    "name": title,
                    "company": company,
                    "url": url,
                    "match": {
                        "match_percentage": int(score),
                        "reason": " • ".join(why[:3]) if isinstance(why, list) else str(why),
                        "missing_skills": missing if isinstance(missing, list) else []
                    }
                })

        return {"jobs": jobs}

    except Exception as e:
        # Печатаем ошибку, чтобы видеть её в терминале
        print(f"!!! MATCHING ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Matching failed: {str(e)}"
        )