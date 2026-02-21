from fastapi import APIRouter, HTTPException

from app.schemas.interview import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewTurnRequest,
    InterviewTurnResponse,
)
from app.services.interview import start_interview, interview_turn

router = APIRouter(prefix="/api/interview", tags=["interview"])


@router.post("/start", response_model=InterviewStartResponse)
def interview_start(payload: InterviewStartRequest):
    try:
        data = start_interview(role=payload.role, level=payload.level, focus=payload.focus)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview start failed: {type(e).__name__}")


@router.post("/turn", response_model=InterviewTurnResponse)
def interview_turn_endpoint(payload: InterviewTurnRequest):
    try:
        data = interview_turn(session_id=payload.session_id, answer=payload.answer)
        return data
    except KeyError:
        raise HTTPException(status_code=404, detail="Unknown session_id")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview turn failed: {type(e).__name__}")