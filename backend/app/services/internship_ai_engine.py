from typing import List, Optional
from app.schemas.matching import InternshipItem
from app.services.hh_parser import fetch_internships_hh


def get_ai_internships(
    role: str,
    internships: Optional[List[InternshipItem]] = None,
    limit: int = 20
) -> List[InternshipItem]:

    # Если уже передали internships — используем их
    if internships:
        return internships[:limit]

    # Иначе парсим HH
    jobs = fetch_internships_hh(
        query=role,
        per_page=limit
    )

    return jobs