import re
import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def run_llm(
    prompt: str,
    *,
    system: str,
    temperature: float = 0.2,
    json_mode: bool = True
):
    """
    Production-safe LLM caller
    """

    # 🔐 Prompt injection cleanup
    prompt = re.sub(
        r"(ignore previous instructions|developer mode|system prompt)",
        "",
        prompt,
        flags=re.IGNORECASE
    )

    # Token safety
    prompt = prompt[:10000]
    system = system[:2000]

    try:
        params = {
            "model": settings.OPENAI_MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": 800
        }

        if json_mode:
            params["response_format"] = {"type": "json_object"}

        resp = client.chat.completions.create(**params)

        text = resp.choices[0].message.content or ""

        if json_mode:
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                # fallback extraction
                start = text.find("{")
                end = text.rfind("}")
                if start != -1 and end != -1:
                    return json.loads(text[start:end + 1])

                return {
                    "error": "invalid_json_from_llm",
                    "raw": text
                }

        return text

    except Exception as e:
        return {
            "error": "llm_call_failed",
            "message": str(e)
        }
def get_openai_client():
    """
    Возвращает инициализированный объект клиента OpenAI.
    Используется там, где нужен прямой доступ к методам SDK.
    """
    return client