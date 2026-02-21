import uuid
from typing import Dict, List, Any, Optional

from app.services.openai_client import run_llm

# Простое in-memory хранилище (на защиту/демо норм)
_SESSIONS: Dict[str, Dict[str, Any]] = {}

SYSTEM = (
    "Ты интервьюер по найму. Отвечай по-русски. "
    "Дай: 1) краткий фидбек на ответ, 2) оценку 0-100, 3) следующий вопрос. "
    "Не используй markdown."
)

def start_interview(role: str, level: str = "intern", focus: Optional[str] = None) -> Dict[str, str]:
    session_id = str(uuid.uuid4())

    # Первый вопрос задаем сразу (без JSON, просто текст вопроса)
    focus_part = f"Фокус: {focus}." if focus else "Фокус не задан."
    prompt = (
        f"Начни интервью.\n"
        f"Роль: {role}\n"
        f"Уровень: {level}\n"
        f"{focus_part}\n\n"
        f"Сформулируй ПЕРВЫЙ вопрос (одна строка)."
    )
    first_question = run_llm(prompt, system=SYSTEM, temperature=0.3).strip()

    _SESSIONS[session_id] = {
        "role": role,
        "level": level,
        "focus": focus,
        "history": [
            {"role": "assistant", "content": first_question}
        ],
        "last_score": 0,
    }

    return {"session_id": session_id, "first_question": first_question}


def interview_turn(session_id: str, answer: str) -> Dict[str, Any]:
    if session_id not in _SESSIONS:
        raise KeyError("Unknown session_id")

    s = _SESSIONS[session_id]
    history: List[Dict[str, str]] = s["history"]

    # Добавляем ответ пользователя
    history.append({"role": "user", "content": answer})

    # Просим модель выдать строго 3 секции, чтобы не ломалось
    prompt = (
        f"Ты проводишь интервью.\n"
        f"Роль: {s['role']}\n"
        f"Уровень: {s['level']}\n"
        f"Фокус: {s['focus'] or 'не задан'}\n\n"
        f"Твоя задача:\n"
        f"1) FEEDBACK: 2-5 предложений фидбека по ответу.\n"
        f"2) SCORE: одно целое число 0-100.\n"
        f"3) NEXT_QUESTION: один следующий вопрос (одна строка).\n\n"
        f"Формат вывода СТРОГО:\n"
        f"FEEDBACK: ...\n"
        f"SCORE: ...\n"
        f"NEXT_QUESTION: ...\n"
    )

    # Важно: run_llm у вас принимает system + temperature,
    # а историю мы "склеим" как контекст вручную (быстро и надежно).
    # Можно улучшить позже, но для защиты ок.
    context = ""
    for m in history[-10:]:  # последние 10 сообщений, чтобы не раздувать
        prefix = "Вопрос" if m["role"] == "assistant" else "Ответ"
        context += f"{prefix}: {m['content']}\n"

    out = run_llm(
        f"Контекст:\n{context}\n\n{prompt}",
        system=SYSTEM,
        temperature=0.2
    ).strip()

    feedback, score, next_q = _parse_interview_output(out)

    # Сохраняем следующий вопрос в историю
    history.append({"role": "assistant", "content": next_q})
    s["last_score"] = score

    return {
        "next_question": next_q,
        "feedback": feedback,
        "score": score,
    }


def _parse_interview_output(text: str) -> tuple[str, int, str]:
    # Очень простой парсер под наш формат
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    feedback = ""
    score = 0
    next_q = ""

    for ln in lines:
        if ln.upper().startswith("FEEDBACK:"):
            feedback = ln.split(":", 1)[1].strip()
        elif ln.upper().startswith("SCORE:"):
            raw = ln.split(":", 1)[1].strip()
            try:
                score = int("".join(ch for ch in raw if ch.isdigit()))
            except Exception:
                score = 0
        elif ln.upper().startswith("NEXT_QUESTION:"):
            next_q = ln.split(":", 1)[1].strip()

    # Фолбэки чтобы никогда не падать
    if not feedback:
        feedback = "Фидбек не распознан. Ответ принят."
    if not next_q:
        next_q = "Расскажите подробнее о вашем опыте и проектах по этой роли."
    score = max(0, min(100, score))

    return feedback, score, next_q