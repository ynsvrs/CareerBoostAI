import json
from fastapi import APIRouter, HTTPException
from app.schemas.coverletter import CoverLetterRequest, CoverLetterResponse
from app.services.openai_client import run_llm

router = APIRouter(prefix="/api/cover-letter", tags=["cover-letter"])

SYSTEM = (
    "Ты карьерный ассистент. Отвечай по-русски. "
    "Верни строго валидный JSON без markdown и без лишнего текста."
)

@router.post("", response_model=CoverLetterResponse)
def generate_cover_letter(payload: CoverLetterRequest):
    prompt = f"""
Сгенерируй сопроводительное письмо и короткое письмо для email.

Верни СТРОГО JSON (только JSON, без ``` и без текста вокруг) с ключами:
- letter (string) — полноценное сопроводительное письмо
- short_email (string) — короткий текст для email (3-6 предложений)

Тон: {payload.tone}
Должность: {payload.job_title}
Компания: {payload.company}

Описание вакансии:
\"\"\"{payload.job_description}\"\"\"

Резюме кандидата:
\"\"\"{payload.resume_text}\"\"\"
"""

    try:
        out = run_llm(prompt, system=SYSTEM, temperature=0.4)
        data = json.loads(out)

        # минимальная страховка: если модель вернула не те ключи
        if "letter" not in data or "short_email" not in data:
            raise ValueError("Missing keys in LLM JSON")

        return data

    except Exception as e:
        # чтобы Swagger не падал 500, но было понятно, что пошло не так
        raise HTTPException(
            status_code=500,
            detail=f"Cover letter generation failed: {type(e).__name__}"
        )