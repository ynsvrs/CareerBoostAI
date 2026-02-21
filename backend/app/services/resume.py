import json
from app.services.openai_client import run_llm

def review_resume(resume_text: str, target_role: str | None = None) -> dict:
    role_line = f"Target role: {target_role}" if target_role else "Target role: not specified"

    system = (
        "You are a strict but helpful career coach. "
        "Return ONLY valid JSON. No markdown. No extra text."
    )

    prompt = f"""
Analyze this resume and give actionable feedback.
{role_line}

Return JSON with EXACT keys:
score (0-100 int),
strengths (list of strings),
issues (list of strings),
improved_bullets (list of strings),
keywords (list of strings),
summary (string, 2-3 sentences).

Resume text:
{resume_text}
""".strip()

    raw = run_llm(prompt, system=system, temperature=0.2)

    # parse JSON
    try:
        data = json.loads(raw)
    except Exception:
        # fallback if model didn't return valid JSON
        data = {
            "score": 70,
            "strengths": ["Good overall structure"],
            "issues": ["Model response was not valid JSON"],
            "improved_bullets": [],
            "keywords": [],
            "summary": raw[:600],
        }

    # normalize
    data["score"] = int(max(0, min(100, data.get("score", 70))))
    for k in ["strengths", "issues", "improved_bullets", "keywords"]:
        if not isinstance(data.get(k), list):
            data[k] = []
    if not isinstance(data.get("summary"), str):
        data["summary"] = ""

    return data