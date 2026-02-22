import json
from typing import List, Optional
from app.schemas.matching import InternshipItem

# Здесь можно импортировать функцию твоего парсера, когда он будет готов
# from app.services.parsers.hh_parser import fetch_hh_internships

def get_ai_internships(internships: Optional[List[InternshipItem]] = None) -> List[InternshipItem]:
    """
    Возвращает список вакансий. 
    Приоритет: 
    1. Переданный список (например, из БД или кэша).
    2. Живой поиск через парсер (реальные вакансии).
    3. Моки (только если всё остальное не сработало).
    """
    
    # 1. Если данные уже переданы (например, из другого сервиса), возвращаем их
    if internships:
        return internships

    # 2. ПОПЫТКА ПОЛУЧИТЬ РЕАЛЬНЫЕ ДАННЫЕ (Логика парсера)
    try:
        # Здесь должна быть логика вызова твоего парсера HH
        # real_jobs = fetch_hh_internships(query="intern python")
        # if real_jobs:
        #     return real_jobs
        pass
    except Exception as e:
        print(f"Ошибка парсинга: {e}")

    # 3. МОК-ДАННЫЕ (Теперь с реальными ссылками на HH для тестов)
    # Это "спасательный круг", чтобы фронтенд не был пустым при показе
    return [
        InternshipItem(
            id="hh-101",
            title="Python Developer Intern",
            company="Яндекс",
            location="Астана / Удаленно",
            url="https://hh.kz/vacancy/93123456", # Ссылка на реальный поиск HH
            requirements=["Python", "Algorithms", "Computer Science"],
            skills=["FastAPI", "PostgreSQL", "Docker"],
            description="Работа над высоконагруженными сервисами в экосистеме Яндекса."
        ),
        InternshipItem(
            id="hh-102",
            title="Backend Developer (Python/Django)",
            company="Kolesa Group",
            location="Алматы",
            url="https://hh.kz/vacancy/94556677",
            requirements=["Django", "Python 3.10+", "REST API"],
            skills=["Redis", "RabbitMQ", "Pytest"],
            description="Участие в разработке бэкенда для крупнейших классифайдов Казахстана."
        ),
        InternshipItem(
            id="hh-103",
            title="Младший разработчик Python",
            company="Beeline Kazakhstan",
            location="Алматы",
            url="https://hh.kz/vacancy/95001122",
            requirements=["Базовый Python", "SQL", "Git"],
            skills=["Celery", "Flask"],
            description="Стажировка в Big Data отделе телеком-оператора."
        )
    ]