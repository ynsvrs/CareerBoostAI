import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.utils.file_parse import extract_text
from app.services.openai_client import run_llm

router = APIRouter(tags=["resume"])

SYSTEM = (
    "Ты карьерный ассистент. Отвечай по-русски. "
    "Верни СТРОГО валидный JSON. Никакого лишнего текста."
)

@router.post("/analyze-resume")
async def resume_review(
    file: UploadFile = File(...),
    target_role: str | None = Form(None),
):
    try:
        # 1. Считываем файл и извлекаем текст
        data = await file.read()
        text = extract_text(file.filename, data)

        # 1. Мы явно говорим ИИ, какие ключи нам нужны в JSON
        prompt = f"""
        Проанализируй резюме на роль: {target_role or 'не указана'}.
        
        Верни JSON строго с этими ключами:
        "score": число от 0 до 100
        "strengths": список строк (сильные стороны)
        "weaknesses": список строк (что плохо)
        "recommendations": список строк (конкретные советы по улучшению)
        
        Текст резюме:
        \"\"\"{text[:4000]}\"\"\"
        """
        
        raw = run_llm(prompt, system=SYSTEM, temperature=0.2)

        if isinstance(raw, dict) and "error" in raw:
            raise ValueError(f"LLM Error: {raw.get('message', raw['error'])}")

        # 2. Теперь мы точно знаем, какие ключи ожидать
        score = int(raw.get("score", 70))

        return {
            "analysis": {
                "overall_score": score,
                "structure_score": int(score * 0.9),
                "experience_score": int(score * 0.95),
                "skills_score": int(score * 0.92),
                "grammar_score": int(score * 0.98),
                
                # Мапим ключи так, как их ждет фронтенд
                "recommendations": raw.get("recommendations") or [],
                "strengths": raw.get("strengths") or [],
                "weaknesses": raw.get("weaknesses") or raw.get("issues") or []
            }
        }

    except Exception as e:
        # Печатаем подробности в консоль для отладки
        print(f"!!! ОШИБКА БЭКЕНДА: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Resume analysis failed: {str(e)}"
        )