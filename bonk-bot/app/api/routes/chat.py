from fastapi import APIRouter
from app.ai.agent.bonk import BonkBot 
from app.models.schemas import ChatRequest, UserSession

router = APIRouter()

bonk_bot = BonkBot()

session_store = {}

@router.post('/')
def ask_bot(request: ChatRequest):
    try:
        user_id = request.userId 
        
        if user_id not in session_store:
            session_store[user_id] = UserSession(
                userId=user_id, 
                username=request.username or f"User_{user_id}"
            )
            
        current_session = session_store[user_id]

        raw_response = bonk_bot.chat(
            session=current_session, 
            user_input=request.message
        )
        
        if isinstance(raw_response, list):
            final_text = "".join([item.get('text', '') if isinstance(item, dict) else str(item) for item in raw_response])
        else:
            final_text = str(raw_response)

        final_text = final_text.strip()

        return {"reply": final_text}

    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
            return {"reply": "request เยอะไป ระบบกำลังพักผ่อนชั่วคราว"}
        
        return {"reply": f"ระบบขัดข้องชั่วคราว: {error_msg}"}