"use client"
import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

function BonkChatWidget() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [inputText, setInputText] = useState<string>('');
    
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "ยินดีต้อนรับ! มีอะไรให้เราช่วยไหมครับ?", sender: "bot" }
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
        
        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');

        try {
            const response = await fetch('http://127.0.0.1:8000/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({
                    userId: 1,   
                    username: "JohnDoe",   
                    message: currentMessage 
                })
            });

            if (!response.ok) {
                throw new Error(`เกิดข้อผิดพลาด: ${response.status}`);
            }

            const data = await response.json();

            const botReply: Message = { 
                id: Date.now() + 1, 
                text: data.reply,
                sender: "bot" 
            };
            setMessages(prev => [...prev, botReply]);

        } catch (error) {
            console.error("Fetch error:", error);
            const errorReply: Message = { 
                id: Date.now() + 1, 
                text: "ขออภัยครับ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ในขณะนี้", 
                sender: "bot" 
            };
            setMessages(prev => [...prev, errorReply]);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-3.75 right-3.75 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
                {isOpen ? 'ปิด' : 'แชท'}
            </button>

            <div 
                className={`
                    fixed z-40 bg-white
                    top-66 bottom-3.75 right-3.75 w-112.5
                    rounded-t-[22px] rounded-b-4xl shadow-[0_10px_40px_rgba(0,0,0,0.15)]
                    overflow-clip flex flex-col
                    origin-bottom-right transition-all duration-200 ease-in-out
                    ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}
                `}
            >
                <div className="bg-blue-600 text-white p-4 font-semibold text-lg shrink-0">
                    Bonk Bot
                </div>

                <div className="flex-1 p-4 bg-gray-50 overflow-y-auto flex flex-col gap-3">
                    {messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                                className={`max-w-[75%] px-4 py-2 text-sm shadow-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm' 
                                    : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form 
                    onSubmit={handleSendMessage}
                    className="p-3 bg-white border-t border-gray-100 shrink-0 rounded-b-4xl"
                >
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="พิมพ์ข้อความที่นี่..." 
                            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit"
                            disabled={!inputText.trim()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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