import httpx
from typing import List
from app.schemas.matching import InternshipItem

def fetch_internships_hh(query: str = "стажировка", area: int = 160, per_page: int = 20) -> List[InternshipItem]:
    """
    Парсит вакансии с hh.ru API.
    area=160 — Казахстан, area=1 — Москва
    """
    url = "https://api.hh.ru/vacancies"
    params = {
        "text": query,
        "area": area,
        "per_page": per_page,
        "experience": "noExperience",
    }

    response = httpx.get(url, params=params)
    response.raise_for_status()
    data = response.json()

    result = []
    for item in data.get("items", []):
        skills = [s["name"] for s in item.get("key_skills", [])]
        snippet = item.get("snippet", {})
        requirements = snippet.get("requirement", "") or ""
        
        result.append(InternshipItem(
            id=str(item["id"]),
            title=item["name"],
            company=item.get("employer", {}).get("name", ""),
            location=item.get("area", {}).get("name", ""),
            url=item.get("alternate_url", ""),
            requirements=[requirements] if requirements else [],
            skills=skills,
            description=snippet.get("responsibility", "") or "",
        ))

    return result