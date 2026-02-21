from typing import List, Optional
from app.schemas.matching import InternshipItem
from app.services.hh_parser import fetch_internships_hh


def get_ai_internships(
    role: str,
    internships: Optional[List[InternshipItem]] = None,
    limit: int = 20
):

    if internships:
        return internships[:limit]

    return fetch_internships_hh(
        query=role,
        per_page=limit
    )