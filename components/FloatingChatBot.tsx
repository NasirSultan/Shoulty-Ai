"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiX, FiMessageCircle } from "react-icons/fi";

interface Message {
    id: string;
    type: "user" | "bot";
    content: string;
    timestamp: Date;
}

export default function FloatingChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            type: "bot",
            content: "👋 Hi! I'm ShoutlyAI's assistant. How can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            type: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);

            // Call RAG Chat API
            const response = await fetch("/api/rag/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: input,
                    topK: 5,
                }),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            const contentType = response.headers.get("content-type");
            let data;

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error("Non-JSON response:", text);
                throw new Error(`Server returned ${response.status}: Invalid response format`);
            }

            if (response.ok && data.success) {
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    type: "bot",
                    content: data.answer || "I couldn't generate a response. Please try again.",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMessage]);
            } else {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    type: "bot",
                    content: data.message || `Sorry, I encountered an error (${response.status}). Please try again.`,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: "bot",
                content: error instanceof Error 
                    ? error.name === "AbortError"
                        ? "The request timed out. Please try again."
                        : `Error: ${error.message}`
                    : "Sorry, I couldn't connect to the server. Please try again later.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            console.error("Chat error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-arial">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">ShoutlyAI Assistant</h3>
                            <p className="text-xs opacity-90">Always here to help</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-blue-800 p-1 rounded-full transition"
                            title="Close chat"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-lg ${
                                        message.type === "user"
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600"
                                    }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 rounded-bl-none">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                disabled={isLoading}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white text-sm disabled:opacity-50"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !input.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Send message"
                            >
                                <FiSend size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Press Enter to send</p>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition transform hover:scale-110 ${
                    isOpen
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                }`}
                title={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
            </button>
        </div>
    );
}
