import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.utils.file_parse import extract_text
from app.services.openai_client import run_llm
from app.schemas.resume import ResumeReviewResponse

router = APIRouter(tags=["resume"])

SYSTEM = (
    "Ты карьерный ассистент. Отвечай по-русски. "
    "Верни ТОЛЬКО валидный JSON. "
    "Никакого текста вне JSON. Никаких markdown и ```."
)

@router.post("/review", response_model=ResumeReviewResponse)
async def resume_review(
    file: UploadFile = File(...),
    target_role: str | None = Form(None),
):
    data = await file.read()

    if len(data) > 2_000_000:
        raise HTTPException(status_code=413, detail="File too large (max 2MB)")

    text = extract_text(file.filename, data)

    prompt = f"""
Проанализируй резюме и улучши его под ATS.

Верни СТРОГО JSON.
Ключи должны быть ТОЧНО такими:

score,
strengths,
issues,
improved_bullets,
keywords,
summary

Где:

score: число от 0 до 100
strengths: массив строк
issues: массив строк
improved_bullets: массив строк
keywords: массив строк
summary: строка

Целевая роль: {target_role or "не указана"}

Резюме:
\"\"\"{text}\"\"\"
"""

    try:
        out = run_llm(prompt, system=SYSTEM, temperature=0.2)

        # 🔥 Защита от мусора вокруг JSON (очень важно)
        start = out.find("{")
        end = out.rfind("}")

        if start != -1 and end != -1:
            out = out[start:end + 1]

        return json.loads(out)

    except Exception as e:
        return {
            "score": 60,
            "strengths": [],
            "issues": [f"LLM/parse error: {type(e).__name__}"],
            "improved_bullets": [],
            "keywords": [],
            "summary": "Ошибка обработки ответа модели",
        }