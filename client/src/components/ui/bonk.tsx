"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

function BonkChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "ยินดีต้อนรับ! มีอะไรให้เราช่วยไหมคะ?", sender: "bot" },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentMessage = inputText;
    const newUserMsg: Message = { id: Date.now(), text: currentMessage, sender: "user" };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          username: "JohnDoe",
          message: currentMessage,
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      
      // ตรวจสอบว่า data.reply เป็น string หรือไม่ (กันบั๊กกรณี API ส่ง object มา)
      const replyText = typeof data.reply === 'string' ? data.reply : JSON.stringify(data.reply);

      setMessages((prev) => [...prev, { id: Date.now() + 1, text: replyText, sender: "bot" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        text: "ขออภัยครับ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", 
        sender: "bot" 
      }]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition-transform active:scale-90"
      >
        {isOpen ? "ปิด" : "แชท"}
      </button>

      <div
        className={`fixed z-40 bg-white top-20 bottom-20 right-4 w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col origin-bottom-right transition-all duration-200 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-blue-600 text-white p-4 font-semibold text-lg shrink-0">
          Bonk Bot
        </div>

        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-2xl rounded-tr-sm"
                    : "bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]} // ช่วยเรื่องการตัดบรรทัดและ Table
                  components={{
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0 inline" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-inherit" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 my-1" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์ข้อความที่นี่..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium disabled:opacity-50"
            >
              ส่ง
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default BonkChatWidget;