import uuid
from typing import Dict, List, Any, Optional
from app.services.openai_client import run_llm

_SESSIONS: Dict[str, Dict[str, Any]] = {}

SYSTEM = (
    "Ты интервьюер по найму. "
    "Отвечай по-русски. "
    "Верни: FEEDBACK, SCORE, NEXT_QUESTION."
)


def start_interview(role: str, level: str = "intern", focus: Optional[str] = None):

    session_id = str(uuid.uuid4())

    prompt = f"""
Начни интервью.

Роль: {role}
Уровень: {level}
Фокус: {focus or "общий"}

Задай первый вопрос (1 строка).
"""

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

    return {
        "session_id": session_id,
        "first_question": first_question
    }


def interview_turn(session_id: str, answer: str):

    if session_id not in _SESSIONS:
        raise KeyError("Unknown session")

    s = _SESSIONS[session_id]
    history: List[Dict[str, str]] = s["history"]

    history.append({"role": "user", "content": answer})

    prompt = f"""
Ты проводишь интервью.

Роль: {s['role']}
Уровень: {s['level']}
Фокус: {s['focus'] or 'общий'}

СТРОГО формат:

FEEDBACK: ...
SCORE: число 0-100
NEXT_QUESTION: ...
"""

    context = "\n".join(
        f"{m['role']}: {m['content']}"
        for m in history[-10:]
    )

    out = run_llm(
        f"{context}\n\n{prompt}",
        system=SYSTEM,
        temperature=0.2
    ).strip()

    feedback, score, next_q = _parse_output(out)

    history.append({"role": "assistant", "content": next_q})
    s["last_score"] = score

    return {
        "next_question": next_q,
        "feedback": feedback,
        "score": score
    }


def _parse_output(text: str):

    feedback = ""
    score = 0
    next_q = ""

    for line in text.splitlines():
        line = line.strip()

        if line.upper().startswith("FEEDBACK"):
            feedback = line.split(":", 1)[1].strip()

        elif line.upper().startswith("SCORE"):
            digits = "".join(ch for ch in line if ch.isdigit())
            score = int(digits) if digits else 0

        elif line.upper().startswith("NEXT_QUESTION"):
            next_q = line.split(":", 1)[1].strip()

    if not feedback:
        feedback = "Фидбек не распознан."

    if not next_q:
        next_q = "Расскажите больше о вашем опыте."

    score = max(0, min(100, score))

    return feedback, score, next_q