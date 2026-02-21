from typing import List, Optional
from app.services.openai_client import run_llm
from app.services.llm_json import parse_llm_to_model
from app.schemas.matching import InternshipItem, MatchingResponse

SYSTEM = (
    "Ты карьерный ассистент и рекрутер. Отвечай по-русски. "
    "Верни ТОЛЬКО валидный JSON без markdown и без текста вне JSON."
)

# Мок-данные (временно). Потом AI engineer будет передавать internships из парсинга.
MOCK_INTERNSHIPS: List[InternshipItem] = [
    InternshipItem(
        id="1",
        title="Backend Intern (Python/FastAPI)",
        company="Kaspi",
        location="Almaty",
        url="https://example.com/kaspi-backend-intern",
        requirements=["Python", "FastAPI", "SQL", "Git"],
        skills=["Python", "FastAPI", "PostgreSQL", "REST", "Git"],
        description="Разработка REST API, работа с базой, тестирование."
    ),
    InternshipItem(
        id="2",
        title="Data Analyst Intern",
        company="Halyk",
        location="Astana",
        url="https://example.com/halyk-da-intern",
        requirements=["SQL", "Excel", "Data visualization"],
        skills=["SQL", "Excel", "Power BI"],
        description="Отчеты, дашборды, анализ данных."
    ),
    InternshipItem(
        id="3",
        title="Frontend Intern (React)",
        company="Air Astana",
        location="Almaty",
        url="https://example.com/aa-react-intern",
        requirements=["JavaScript", "React", "HTML", "CSS"],
        skills=["React", "JS", "CSS"],
        description="UI, компоненты, интеграция API."
    ),
]


def recommend_internships(
    target_role: str,
    user_skills: List[str],
    resume_text: Optional[str],
    internships: Optional[List[InternshipItem]],
    top_k: int = 5,
) -> MatchingResponse:
    jobs = internships or MOCK_INTERNSHIPS
    if not jobs:
        return MatchingResponse(results=[])

    # Ограничим top_k
    top_k = max(1, min(10, top_k))

    # Сжимаем вакансии, чтобы не улететь в токены
    jobs_payload = []
    for j in jobs[:50]:  # на всякий случай ограничение
        jobs_payload.append({
            "id": j.id,
            "title": j.title,
            "company": j.company,
            "location": j.location,
            "url": j.url,
            "requirements": j.requirements or [],
            "skills": j.skills or [],
            "description": (j.description or "")[:600],
        })

    prompt = f"""
Твоя задача: подобрать наиболее подходящие стажировки.

Данные кандидата:
- target_role: {target_role}
- skills: {user_skills}
- resume_text (может быть пусто): {resume_text or ""}

Список стажировок (JSON):
{jobs_payload}

Верни СТРОГО JSON формата:
{{
  "results": [
    {{
      "id": "string",
      "title": "string",
      "company": "string",
      "url": "string or null",
      "match_score": 0-100,
      "why_match": ["string", ...],
      "missing_skills": ["string", ...]
    }}
  ]
}}

Правила:
- Верни ровно top_k={top_k} результатов (если вакансий меньше — верни сколько есть).
- why_match: 2-4 пункта.
- missing_skills: 0-6 пунктов.
- match_score: целое 0-100.
"""

    out = run_llm(prompt, system=SYSTEM, temperature=0.2)

    # Валидируем строгой схемой
    resp = parse_llm_to_model(out, MatchingResponse)

    # Нормализуем score диапазон
    for r in resp.results:
        r.match_score = max(0, min(100, int(r.match_score)))

    # Подрежем до top_k на всякий случай
    resp.results = resp.results[:top_k]
    return resp