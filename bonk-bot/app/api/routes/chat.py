from fastapi import APIRouter
from app.ai.agent.bonk import setup_agent
from app.models.schemas import ChatRequest, chatResponse

router = APIRouter()
bonk_agent = setup_agent()

@router.post('/')
def ask_bot(request: ChatRequest):
    try:
        response = bonk_agent.invoke({"input": request.message})
        
        final_text = response.get("output", "")
        
        if isinstance(final_text, list):
            parsed_text = ""
            for item in final_text:
                if isinstance(item, dict) and 'text' in item:
                    parsed_text += item['text']
                elif isinstance(item, str):
                    parsed_text += item
            final_text = parsed_text
            
        return {"reply": final_text}

    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
            return {"reply": "request เยอะไป"}
        
        return {"reply": f"ระบบขัดข้องชั่วคราว: {error_msg}"}
