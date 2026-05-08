"use client";
import { Bot, X, Loader2, SendHorizontal } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "ยินดีต้อนรับ! มีอะไรให้เราช่วยไหมคะ?", sender: "bot" },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const currentMessage = inputText;
    const newUserMsg: Message = {
      id: Date.now(),
      text: currentMessage,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText("");
    setIsLoading(true);

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
      const replyText =
        typeof data.reply === "string"
          ? data.reply
          : JSON.stringify(data.reply);

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: replyText, sender: "bot" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "⚠️ ขออภัยค่ะ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ในขณะนี้ โปรดลองใหม่อีกครั้ง",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ปุ่มเปิด Chat (จะซ่อนเมื่อเปิดหน้าต่างแชท) */}
      <div
        className={`fixed bottom-6 right-6 lg:bottom-12 lg:right-12 z-50 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-0 scale-75 pointer-events-none translate-y-4"
            : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <button
          onClick={() => setIsOpen(true)}
          aria-label="เปิดหน้าต่างแชท"
          className="cursor-pointer bg-black text-white p-4 lg:p-5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-95 border border-white/20 transition-all duration-300 ease-out flex items-center justify-center"
        >
          <Bot size={28} />
        </button>
      </div>

      {/* หน้าต่าง Chat */}
      <div
        className={`fixed z-40 bg-white bottom-6 lg:bottom-12 right-4 sm:right-6 lg:right-12 w-[calc(100vw-2rem)] sm:w-96 h-137.5 max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col origin-bottom-right transition-all duration-300 ease-out border border-gray-100 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100 visible"
            : "translate-y-8 scale-90 opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Header - เพิ่มปุ่มกากบาท X ที่นี่ */}
        <div className="bg-black text-white p-4 font-semibold text-lg shrink-0 shadow-sm flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Bot size={24} />
            <span>Bonk Bot</span>
            
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="ปิดหน้าต่างแชท"
            className="cursor-pointer p-1.5 bg-white/10 hover:bg-white/25 rounded-full transition-colors duration-200 active:scale-95 flex items-center justify-center"
          >
            <X size={20} className="text-white " />
          </button>
        </div>
        

        {/* พื้นที่ข้อความ */}
        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto flex flex-col gap-4 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm wrap-break-word whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-black text-white rounded-2xl rounded-tr-sm"
                    : "bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="mb-2 last:mb-0" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-inherit" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc ml-4 mb-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal ml-4 mb-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-1" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="underline hover:opacity-80 text-blue-200"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex w-full justify-start animate-in fade-in duration-300">
              <div className="bg-white text-gray-500 rounded-2xl rounded-tl-sm border border-gray-200 px-4 py-3 shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">กำลังคิด...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* ฟอร์มส่งข้อความ */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-gray-100 shrink-0 relative z-10"
        >
          <div className="flex gap-2 items-center relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder="พิมพ์ข้อความที่นี่..."
              className="flex-1 pl-4 pr-12 py-3 bg-gray-100 hover:bg-gray-200/50 focus:bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-transparent focus:border-blue-500 text-gray-800 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="cursor-pointer absolute right-1 top-1 bottom-1 bg-blue-600 text-white w-10 flex items-center justify-center rounded-full font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-800 active:scale-95 transition-all"
            >
              <SendHorizontal
                size={18}
                className={`${isLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
              />
              {isLoading && (
                <Loader2 size={18} className="animate-spin absolute" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default BonkChatWidget;
