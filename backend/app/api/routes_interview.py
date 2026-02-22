from fastapi import APIRouter, HTTPException, Form
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewTurnRequest,
    InterviewTurnResponse,
)
from app.services.interview import interview_turn
from app.services.openai_client import run_llm
import json
import re

router = APIRouter(prefix="/api/interview", tags=["interview"])


# -----------------------------
# START INTERVIEW
# -----------------------------

@router.post("/start")
def interview_start(payload: InterviewStartRequest):
    try:
        system = "Ты HR эксперт. Отвечай ТОЛЬКО валидным JSON, без лишнего текста."

        prompt = f"""
Сгенерируй 6-8 вопросов для собеседования.

Позиция: {payload.role}
Уровень: {payload.level}
Фокус: {payload.focus or "общий"}

Верни ТОЛЬКО JSON:

{{
  "questions": [
    {{"type": "general", "question": "вопрос"}},
    {{"type": "technical", "question": "вопрос"}}
  ]
}}
"""

        out = run_llm(prompt, system=system, temperature=0.7)

        # Здесь была ошибка: передаем 'out' в парсер
        data = _safe_json_parse(out)

        # Добавляем id для фронта
        if data and "questions" in data:
            for i, q in enumerate(data.get("questions", []), 1):
                q["id"] = i

        return data

    except Exception as e:
        print(f"!!! Error in interview_start: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Interview start failed: {str(e)}"
        )


# -----------------------------
# EVALUATE ANSWER
# -----------------------------

@router.post("/evaluate")
async def interview_evaluate(
    question: str = Form(...),
    answer: str = Form(...),
    position: str = Form(...)
):
    try:
        system = "Ты строгий HR эксперт. Отвечай ТОЛЬКО JSON."

        prompt = f"""
Оцени ответ кандидата.

Позиция: {position}
Вопрос: {question}
Ответ: {answer}

Верни JSON:

{{
  "evaluation": {{
    "score": 1-10,
    "positive": "что было хорошо",
    "improvements": "что улучшить",
    "better_answer": "пример сильного ответа"
  }}
}}
"""

        out = run_llm(prompt, system=system, temperature=0.5)
        data = _safe_json_parse(out)

        return data

    except Exception as e:
        print(f"!!! Error in evaluate: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )


# -----------------------------
# OLD TURN LOGIC
# -----------------------------

@router.post("/turn", response_model=InterviewTurnResponse)
def interview_turn_endpoint(payload: InterviewTurnRequest):
    try:
        return interview_turn(
            session_id=payload.session_id,
            answer=payload.answer
        )
    except KeyError:
        raise HTTPException(status_code=404, detail="Unknown session_id")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Interview turn failed: {str(e)}"
        )


# -----------------------------
# SAFE JSON PARSER ⭐ ИСПРАВЛЕННЫЙ
# -----------------------------

def _safe_json_parse(text):
    """Safely extract JSON from LLM response"""
    
    # ЕСЛИ ПРИШЕЛ СЛОВАРЬ — просто возвращаем его (фикс ошибки 'got dict')
    if isinstance(text, dict):
        return text

    try:
        return json.loads(text)
    except:
        # Пытаемся вырезать JSON из строки, если там есть лишний текст
        try:
            match = re.search(r"\{.*\}", str(text), re.DOTALL)
            if match:
                return json.loads(match.group())
        except:
            pass

        raise ValueError(f"LLM returned invalid JSON format. Received: {type(text)}")