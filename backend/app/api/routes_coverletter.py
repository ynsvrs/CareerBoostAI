import json
import re
from fastapi import APIRouter, HTTPException
from app.schemas.coverletter import CoverLetterRequest, CoverLetterResponse
from app.services.openai_client import run_llm

router = APIRouter(prefix="/api/cover-letter", tags=["cover-letter"])

SYSTEM = (
    "Ты карьерный ассистент. Отвечай по-русски. "
    "Верни ТОЛЬКО валидный JSON без markdown, без ``` и без текста вне JSON."
)


@router.post("/generate", response_model=CoverLetterResponse)
def generate_cover_letter(payload: CoverLetterRequest):

    prompt = f"""
Сгенерируй сопроводительное письмо и короткий email вариант.

Верни ТОЛЬКО JSON:

{{
  "letter": "полное сопроводительное письмо",
  "short_email": "короткое письмо (3-6 предложений)"
}}

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

        data = _safe_json_parse(out)

        # Проверка обязательных полей
        if not isinstance(data.get("letter"), str):
            raise ValueError("Invalid letter field")
        if not isinstance(data.get("short_email"), str):
            raise ValueError("Invalid short_email field")

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Cover letter generation failed: {str(e)}"
        )


# -----------------------------
# SAFE JSON PARSER ⭐
# -----------------------------

def _safe_json_parse(text: str):
    """Safely extract JSON from LLM response"""

    try:
        return json.loads(text)
    except:

        # Try extracting JSON block
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())

        raise ValueError("LLM returned invalid JSON")