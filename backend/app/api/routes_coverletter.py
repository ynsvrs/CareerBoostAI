import json
import re
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.openai_client import run_llm

# --- СХЕМЫ ДАННЫХ ---
class CoverLetterRequest(BaseModel):
    resume_text: str
    job_title: str
    company: str
    job_description: str
    tone: str = "professional"

class CoverLetterResponse(BaseModel):
    letter: str
    short_email: str

# --- РОУТЕР ---
router = APIRouter(prefix="/api/cover-letter", tags=["cover-letter"])

SYSTEM = (
    "Ты карьерный ассистент. Отвечай по-русски. "
    "Верни ТОЛЬКО валидный JSON без markdown, без ``` и без текста вне JSON."
)

# -----------------------------
# SAFE JSON PARSER ⭐ (Фикс ошибки 'got dict')
# -----------------------------
def _safe_json_parse(data):
    """Универсальный парсер: понимает и строку, и словарь"""
    if isinstance(data, dict):
        return data  # Если это уже словарь, просто возвращаем его
    
    try:
        return json.loads(data)
    except:
        # Попытка вырезать JSON из строки, если LLM добавил лишний текст
        match = re.search(r"\{.*\}", str(data), re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                pass
        raise ValueError("LLM returned invalid JSON format")

# -----------------------------
# GENERATE ENDPOINT
# -----------------------------
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
        # Вызов ИИ
        out = run_llm(prompt, system=SYSTEM, temperature=0.4)

        # Безопасный парсинг
        data = _safe_json_parse(out)

        # Проверка наличия полей в ответе
        final_data = {
            "letter": data.get("letter") or "Не удалось сгенерировать основное письмо.",
            "short_email": data.get("short_email") or "Не удалось сгенерировать email-вариант."
        }

        return final_data

    except Exception as e:
        print(f"!!! Error in Cover Letter generation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Cover letter generation failed: {str(e)}"
        )