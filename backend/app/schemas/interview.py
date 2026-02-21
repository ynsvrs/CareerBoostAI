from pydantic import BaseModel

class InterviewStartRequest(BaseModel):
    role: str
    level: str = "intern"
    focus: str | None = None

class InterviewStartResponse(BaseModel):
    session_id: str
    first_question: str

class InterviewTurnRequest(BaseModel):
    session_id: str
    answer: str

class InterviewTurnResponse(BaseModel):
    next_question: str
    feedback: str
    score: int