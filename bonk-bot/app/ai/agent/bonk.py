from langchain_google_genai import ChatGoogleGenerativeAI 
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.agents import ( 
    AgentExecutor,
    create_tool_calling_agent,
    tool,
)
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage 
from app.ai.tools.news_tool import NewsTools
from app.ai.prompt.prompt_templates import Prompt
from app.models.schemas import UserSession
from app.core.config import settings


class BonkBot():
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2,
            max_retries=3
        )
        self.tools = NewsTools().get_tools()
        self.prompt = Prompt().get_prompt()
        self.agent = create_tool_calling_agent(self.llm, self.tools, self.prompt)
        self.executor = AgentExecutor(agent=self.agent, tools=self.tools, verbose=True)
        
        self.parser = StrOutputParser()

    def chat(self, session: UserSession, user_input: str) -> str:
            response = self.executor.invoke({
                "input": user_input,
                "chat_history": session.chat_history 
            })
            
            raw_output = response["output"]

            if isinstance(raw_output, list):
                texts = []
                for item in raw_output:
                    if isinstance(item, dict) and 'text' in item:
                        texts.append(item['text'])
                    elif isinstance(item, str):
                        texts.append(item)
                answer = "".join(texts)
            else:
                answer = str(raw_output)

            answer = self.parser.invoke(answer)

            session.chat_history.append(HumanMessage(content=user_input))
            session.chat_history.append(AIMessage(content=answer))

            return answer