import json
from app.services.openai_client import run_llm

def review_resume(resume_text: str, target_role: str | None = None) -> dict:
    role_line = f"Target role: {target_role}" if target_role else "Target role: not specified"

    system = (
        "You are a strict but helpful career coach. "
        "Return ONLY valid JSON. No markdown. No extra text."
    )

    prompt = f"""
You are reviewing a resume for a job seeker.
{role_line}

Carefully analyze the resume and provide:
- score: overall quality score 0-100
- strengths: what is done well (3-5 points)
- issues: specific problems to fix (3-5 points)
- improved_bullets: rewrite weak bullet points to be stronger and more quantified
- keywords: important ATS keywords missing from the resume
- summary: brief overall assessment in 2-3 sentences

Be specific and actionable. Focus on measurable improvements.
Return ONLY valid JSON with EXACT keys: score, strengths, issues, improved_bullets, keywords, summary.

Resume:
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