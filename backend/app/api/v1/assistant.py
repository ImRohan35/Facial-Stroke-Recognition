from pydantic import BaseModel
from fastapi import APIRouter
from app.services.assistant_service import generate_assistant_response

router = APIRouter(prefix="/assistant", tags=["Educational AI Assistant"])

class ChatMessage(BaseModel):
    message: str

@router.post("/chat")
def chat_with_assistant(chat_in: ChatMessage):
    """Answers patient questions safely or routes to emergency mode."""
    response = generate_assistant_response(chat_in.message)
    return response
