"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiX, FiMessageCircle, FiTrash2 } from "react-icons/fi";
import { SparklesIcon } from "@heroicons/react/24/outline";

interface Message {
    id: string;
    type: "user" | "bot";
    content: string;
    timestamp: Date;
}

import { API_ENDPOINTS } from "@/api/configApi";

const STORAGE_KEY = "shoutly_chat_history";

const INITIAL_MESSAGE: Message = {
    id: "1",
    type: "bot",
    content: "👋 Welcome to Shoutly AI\nCreate • Schedule • Publish • Grow\nI can help you with:\n💰 Pricing & Plans\n🚀 Product Features\n📱 Platform Integrations\n🎨 AI Content Creation\n📅 Book a Demo\n❓ Product Support\nWhat would you like to explore?",
    timestamp: new Date(),
};

function loadMessages(): Message[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [INITIAL_MESSAGE];
        const parsed = JSON.parse(stored) as Message[];
        return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch {
        return [INITIAL_MESSAGE];
    }
}

function saveMessages(messages: Message[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
}

function formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMessage(text: string) {
    // Split on numbered patterns like "1)" "2)" "1." "2." or "\n"
    const lines = text
        .replace(/([.!?])\s+(\d+[\)\.]\s)/g, "$1\n$2") // break before numbers mid-sentence
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    if (lines.length <= 1) return <span>{text}</span>;

    return (
        <span>
            {lines.map((line, i) => {
                const isNumbered = /^\d+[\)\.]\s/.test(line);
                return (
                    <span key={i} className={`block ${isNumbered ? "mt-1" : i > 0 ? "mt-1" : ""}`}>
                        {isNumbered ? (
                            <span className="flex gap-1.5">
                                <span className="font-bold text-orange-500 flex-shrink-0">
                                    {line.match(/^\d+[\)\.]/)?.[0]}
                                </span>
                                <span>{line.replace(/^\d+[\)\.]\s*/, "")}</span>
                            </span>
                        ) : line}
                    </span>
                );
            })}
        </span>
    );
}

export default function FloatingChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages(loadMessages());
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    useEffect(() => {
        if (messages.length > 0) saveMessages(messages);
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleClearChat = () => {
        const fresh: Message[] = [{ ...INITIAL_MESSAGE, id: Date.now().toString(), timestamp: new Date() }];
        setMessages(fresh);
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);

            const response = await fetch(API_ENDPOINTS.ragChat, {
                method: "POST",
                headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({ query: userMessage.content, topK: 5 }),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            const contentType = response.headers.get("content-type");
            let data: any = {};
            if (contentType?.includes("application/json")) {
                data = await response.json();
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: "bot",
                content: response.ok && data.success
                    ? data.answer || "I couldn't generate a response. Please try again."
                    : data.message || `Sorry, something went wrong. Please try again.`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    type: "bot",
                    content: error instanceof Error && error.name === "AbortError"
                        ? "Request timed out. Please try again."
                        : "Sorry, I couldn't connect. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div
                    className="mb-4 flex flex-col rounded-2xl overflow-hidden border border-gray-100 w-[320px] max-w-[calc(100vw-2rem)] h-[440px] max-h-[70vh]"
                    style={{
                        boxShadow: "0 24px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(249,115,22,0.08)",
                        animation: "chatSlideUp 0.25s ease-out",
                    }}
                >
                    <style>{`
                        @keyframes chatSlideUp {
                            from { opacity: 0; transform: translateY(16px) scale(0.97); }
                            to   { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        @keyframes typingDot {
                            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                            30%           { transform: translateY(-6px); opacity: 1; }
                        }
                    `}</style>

                    {/* ── Header ── */}
                    <div style={{ background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)" }} className="px-3 py-2.5 flex items-center gap-2.5">
                        {/* Bot avatar */}
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <SparklesIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-xs leading-none">ShoutlyAI Assistant</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-white/80 text-[10px]">Online · replies instantly</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleClearChat}
                                title="Clear conversation"
                                className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition text-white/80 hover:text-white"
                            >
                                <FiTrash2 size={12} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Close"
                                className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition text-white/80 hover:text-white"
                            >
                                <FiX size={13} />
                            </button>
                        </div>
                    </div>

                    {/* ── Quick suggestion chips (show only when ≤1 message) ── */}
                    {messages.length <= 1 && (
                        <div className="px-2.5 pt-2 flex flex-wrap gap-1.5 bg-white">
                            {["💰 Pricing", "🚀 Features", "📅 Get Started"].map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => {
                                        setInput(chip.replace(/^.\s/, ""));
                                    }}
                                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 transition"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Messages ── */}
                    <div className="flex-1 overflow-y-auto bg-white px-3 py-2.5 space-y-3">
                        {messages.filter((msg) => {
                            // Hide the initial greeting once the user has sent at least one message
                            const hasUserMessage = messages.some((m) => m.type === "user");
                            if (hasUserMessage && msg.id === messages[0]?.id && msg.type === "bot") return false;
                            return true;
                        }).map((msg) => (
                            <div key={msg.id} className={`flex gap-1.5 ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                {/* Avatar */}
                                {msg.type === "bot" && (
                                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold mt-0.5"
                                        style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
                                        AI
                                    </div>
                                )}

                                <div className={`flex flex-col gap-0.5 max-w-[80%] ${msg.type === "user" ? "items-end" : "items-start"}`}>
                                    <div
                                        className={`px-2.5 py-1.5 rounded-xl text-[12px] leading-relaxed ${
                                            msg.type === "user"
                                                ? "text-white rounded-tr-sm"
                                                : "bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm"
                                        }`}
                                        style={msg.type === "user" ? { background: "linear-gradient(135deg,#f97316,#ef4444)" } : {}}
                                    >
                                        {msg.type === "bot" ? formatMessage(msg.content) : msg.content}
                                    </div>
                                    <span className="text-[9px] text-gray-400 px-1">{formatTime(msg.timestamp)}</span>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex gap-1.5">
                                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold"
                                    style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
                                    AI
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"
                                            style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Input ── */}
                    <div className="bg-white border-t border-gray-100 px-2.5 py-2">
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition px-2.5 py-1.5">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message…"
                                disabled={isLoading}
                                className="flex-1 bg-transparent text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none disabled:opacity-50 min-w-0"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !input.trim()}
                                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}
                                title="Send"
                            >
                                <FiSend size={11} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toggle Button ── */}
            <div className="relative flex justify-end">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    title={isOpen ? "Close chat" : "Chat with us"}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{
                        background: isOpen ? "#6b7280" : "linear-gradient(135deg,#f97316,#ef4444)",
                        boxShadow: isOpen ? "none" : "0 8px 24px rgba(249,115,22,0.4)",
                    }}
                >
                    {isOpen ? <FiX size={18} /> : <FiMessageCircle size={18} />}
                </button>
            </div>
        </div>
    );
}
