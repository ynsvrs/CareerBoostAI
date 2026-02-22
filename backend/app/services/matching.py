import json
import re
from typing import List, Optional
from app.services.openai_client import run_llm
from app.schemas.matching import InternshipItem, MatchingResponse

SYSTEM = (
    "Ты опытный карьерный ассистент и рекрутер. Отвечай строго по-русски. "
    "Верни ТОЛЬКО валидный JSON. Не добавляй никаких пояснений, текста или markdown-разметки (типа ```json) вне структуры JSON."
)

def recommend_internships(
    target_role: str,
    user_skills: List[str],
    resume_text: Optional[str],
    internships: Optional[List[InternshipItem]],
    top_k: int = 5,
) -> MatchingResponse:
    """
    Анализирует список стажировок через LLM и подбирает лучшие варианты для кандидата.
    """
    from app.services.internship_ai_engine import get_ai_internships

    # 1. Получаем список вакансий (из парсера или переданный список)
    # Используем get_ai_internships, так как она агрегирует данные из HH и моков
    jobs = get_ai_internships(internships=internships)
    
    if not jobs:
        return MatchingResponse(results=[])

    # 2. Подготовка полезной нагрузки (payload) для LLM
    # Извлекаем список, если пришел словарь, иначе используем как есть
    actual_jobs = jobs.get("internships", []) if isinstance(jobs, dict) else jobs
    
    jobs_payload = []
    # Берем первые 30-40 вакансий, чтобы не превысить лимит токенов контекста
    for j in actual_jobs[:40]:
        def get_field(obj, key):
            """Безопасно извлекает поле из объекта или словаря."""
            return obj.get(key) if isinstance(obj, dict) else getattr(obj, key, "")

        jobs_payload.append({
            "id": str(get_field(j, "id")),
            "title": get_field(j, "title"),
            "company": get_field(j, "company"),
            "location": get_field(j, "location"),
            "url": get_field(j, "url"),
            "requirements": get_field(j, "requirements") or [],
            "skills": get_field(j, "skills") or [],
            "description": str(get_field(j, "description") or "")[:500], # Ограничиваем длину описания
        })

    # 3. Формирование промпта
    top_k = max(1, min(10, top_k)) # Ограничение от 1 до 10
    
    prompt = f"""
Ты — AI-рекрутер. Найди самые подходящие стажировки из списка ниже.

Кандидат:
- Цель: {target_role}
- Навыки: {", ".join(user_skills) if isinstance(user_skills, list) else user_skills}
- Резюме: {resume_text or "Информация отсутствует"}

Список стажировок:
{json.dumps(jobs_payload, ensure_ascii=False)}

ЗАДАЧА:
Выбери ТОП-{top_k} вакансий. Отсортируй их по убыванию соответствия (match_score).

Верни СТРОГО JSON в формате:
{{
  "results": [
    {{
      "id": "string",
      "title": "string",
      "company": "string",
      "url": "string",
      "match_score": 0-100,
      "why_match": ["причина 1", "причина 2"],
      "missing_skills": ["навык 1"]
    }}
  ]
}}
"""

    # 4. Вызов LLM
    try:
        response_text = run_llm(prompt, system=SYSTEM, temperature=0.2)
        
        # 5. Надежный парсинг JSON из ответа ИИ
        if isinstance(response_text, dict):
            data = response_text
        else:
            # Ищем JSON внутри строки (на случай, если ИИ прислал markdown ```json ... ```)
            json_match = re.search(r"\{.*\}", str(response_text), re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
            else:
                print("!!! ERROR: LLM returned no valid JSON")
                return MatchingResponse(results=[])

        # 6. Валидация и возврат результата
        results = data.get("results", [])
        return MatchingResponse(results=results)

    except Exception as e:
        print(f"!!! MATCHING SERVICE ERROR: {str(e)}")
        # Возвращаем пустой результат вместо падения сервера
        return MatchingResponse(results=[])