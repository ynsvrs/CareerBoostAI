import json
from typing import Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


def parse_llm_json(text: str) -> dict:
    """
    Достаёт JSON даже если модель обернула его лишним текстом.
    """
    if not isinstance(text, str):
        raise ValueError("LLM output is not a string")

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in LLM output")

    json_str = text[start:end + 1]
    return json.loads(json_str)


def parse_llm_to_model(text: str, model: Type[T]) -> T:
    data = parse_llm_json(text)
    return model.model_validate(data)