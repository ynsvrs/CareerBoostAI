from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_resume import router as resume_router
from app.api.routes_interview import router as interview_router
from app.api.routes_matching import router as matching_router
from app.api.routes_coverletter import router as cover_router

from app.services.openai_client import run_llm

app = FastAPI(title="CareerBoostAI Backend", version="0.1.0")

# Настройка CORS, чтобы фронтенд мог достучаться до бэкенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Разрешаем запросы со всех адресов для тестов
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Резюме: добавляем префикс /api здесь, так как в файле его нет
app.include_router(resume_router, prefix="/api")

# 2. Интервью, Мэтчинг, Ковер: префиксы уже есть внутри файлов (/api/interview и т.д.)
app.include_router(interview_router)
app.include_router(matching_router)
app.include_router(cover_router)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/debug/openai")
def debug_openai():
    """Проверка связи с OpenAI"""
    text = run_llm("Say only the word: ok", system="You are a test.", temperature=0)
    return {"result": text}