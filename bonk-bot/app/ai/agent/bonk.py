from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.agents import (
    AgentExecutor,
    create_tool_calling_agent,
    tool,
)
from app.core.config import settings
from app.ai.tools.news_tool import search_google, search_finance_api

def setup_agent():
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0.2,
        max_retries=3
    )

    tools = [search_google, search_finance_api]

    prompt = ChatPromptTemplate.from_messages([
        ("system", """คุณคือ AI ผู้เชี่ยวชาญด้านการวิเคราะห์ข้อมูล คุณมีเครื่องมือ 2 อย่าง:
        1. search_finance_api: ใช้สำหรับหาข่าวบริษัท/ข่าวหุ้น ที่ต้องการความแม่นยำสูง
        2. search_google: ใช้สำหรับหาความรู้ทั่วไป กระแสสังคม หรือบทความ
        
        จงพิจารณาคำถามของผู้ใช้ และเลือกใช้เครื่องมือให้เหมาะสมที่สุด (สามารถใช้พร้อมกันทั้ง 2 ตัวได้ถ้าจำเป็น)
        เมื่อได้ข้อมูลแล้ว จงสรุปเป็นภาษาไทยที่อ่านง่าย พร้อมระบุแหล่งที่มาเสมอ"""),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"), 
    ])
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

# bonk_agent = setup_agent()

# def get_ai_response(message: str) -> str:
#     response = bonk_agent.invoke({"input": message})
#     return response["output"]

# response = get_ai_response("สรุปข่าว rklb ช่วงนี้หน่อย")
# print(response[0]['text'])