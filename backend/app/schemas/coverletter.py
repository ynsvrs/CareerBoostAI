from pydantic import BaseModel

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_title: str
    company: str
    job_description: str
    tone: str = "professional"

class CoverLetterResponse(BaseModel):
    letter: str
    short_email: str