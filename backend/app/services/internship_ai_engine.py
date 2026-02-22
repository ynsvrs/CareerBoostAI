import json
from typing import List
from app.schemas.matching import InternshipItem
from app.services.openai_client import get_openai_client

SYSTEM_PROMPT = """
Ты HR-ассистент. Анализируй список стажировок и возвращай JSON.

Формат ответа строго:

{
  "summary": "краткое описание рынка",
  "top_skills": ["skill1", "skill2"],
  "recommendations": ["совет1", "совет2"]
}

Никакого текста вне JSON.
"""

def get_ai_internships(internships: List[InternshipItem]) -> dict:
    """
    Анализирует список стажировок через OpenAI и возвращает структурированный отчет.
    Название функции изменено на get_ai_internships для корректного импорта в routes.
    """
    if not internships:
        return {
            "summary": "Нет данных для анализа",
            "top_skills": [],
            "recommendations": []
        }

    # Получаем прямой клиент OpenAI из твоего сервиса
    client = get_openai_client()

    # Подготовка данных для промпта
    formatted_data = "\n\n".join([
        f"""
Название: {i.title}
Компания: {i.company}
Требования: {", ".join(i.requirements) if i.requirements else "не указаны"}
Навыки: {", ".join(i.skills) if i.skills else "не указаны"}
Описание: {i.description}
"""
        for i in internships
    ])

    # 🔥 Token safety: ограничение размера входного текста (примерно 12к символов)
    MAX_CHARS = 12000
    if len(formatted_data) > MAX_CHARS:
        formatted_data = formatted_data[:MAX_CHARS]

    try:
        # Вызов модели
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.3,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": formatted_data}
            ],
            max_tokens=800,
            response_format={"type": "json_object"}
        )

        # Извлечение контента
        content = response.choices[0].message.content or ""

        # Проверка на пустой ответ
        if not content:
            raise ValueError("Модель вернула пустой ответ")

        # Парсинг JSON
        return json.loads(content)

    except json.JSONDecodeError as e:
        # Если ИИ вдруг выдал битый JSON
        print(f"Ошибка декодирования JSON: {e}")
        return {
            "summary": "Ошибка обработки формата ответа модели",
            "top_skills": [],
            "recommendations": ["Попробуйте повторить запрос позже"],
            "error": "json_decode_error"
        }

    except Exception as e:
        # Обработка всех остальных ошибок (сеть, API key, лимиты)
        print(f"Ошибка при вызове OpenAI: {e}")
        return {
            "summary": "Ошибка при взаимодействии с ИИ",
            "top_skills": [],
            "recommendations": [],
            "error": str(e)
        }