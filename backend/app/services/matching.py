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
    from app.services.internship_ai_engine import get_ai_internships

    jobs = get_ai_internships(role=target_role,internships=internships
)
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
Ты опытный карьерный консультант. Твоя задача — найти наиболее подходящие стажировки для кандидата.

Профиль кандидата:
- Желаемая роль: {target_role}
- Навыки: {user_skills}
- Резюме: {resume_text or "не указано"}

Доступные стажировки:
{jobs_payload}

Оцени каждую стажировку и выбери топ {top_k} наиболее подходящих.

Критерии оценки:
- Совпадение навыков кандидата с требованиями
- Соответствие желаемой роли
- Потенциал для роста

Верни СТРОГО JSON:
{{
  "results": [
    {{
      "id": "string",
      "title": "string",
      "company": "string",
      "url": "string or null",
      "match_score": 0-100,
      "why_match": ["причина 1", "причина 2"],
      "missing_skills": ["навык 1", "навык 2"]
    }}
  ]
}}

Правила:
- Ровно {top_k} результатов, отсортированных по match_score (от высокого к низкому)
- why_match: 2-4 конкретные причины почему подходит
- missing_skills: чего не хватает кандидату для этой позиции
- match_score: целое число 0-100
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