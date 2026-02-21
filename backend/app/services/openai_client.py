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
) -> str:
    """
    Production-safe LLM caller
    """

    # 🔥 Security protection (prompt injection cleanup)
    prompt = re.sub(
        r"(ignore previous|developer mode|system prompt)",
        "",
        prompt,
        flags=re.IGNORECASE
    )

    # Token safety
    prompt = prompt[:10000]
    system = system[:2000]

    try:
        resp = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],

            temperature=temperature,
            timeout=30,

            # ⭐ IMPORTANT — structured output
            response_format={"type": "json_object"} if json_mode else None,

            # Limit output size
            max_tokens=800
        )

        text = resp.choices[0].message.content or ""

        # If JSON mode → validate
        if json_mode:
            try:
                json.loads(text)
                return text
            except:

                # fallback JSON extraction
                start = text.find("{")
                end = text.rfind("}")

                if start != -1 and end != -1:
                    return text[start:end + 1]

                raise ValueError("Invalid LLM JSON response")

        return text

    except Exception as e:
        # Safe fallback instead of crashing production
        return json.dumps({
            "error": "llm_call_failed",
            "message": str(e)
        })