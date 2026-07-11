"use client";

import { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "@/api/configApi";

const GRAD = "linear-gradient(115deg,#F97316,#EA580C)";

const chatIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z" />
  </svg>
);

export default function ChatWidget() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<{ type: "bot" | "user"; text: string }[]>([
    { type: "bot", text: "Hi! I'm Shoutly AI. Ask me anything about your account, features, or content strategy." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setChatOpen(true);
    document.addEventListener("shoutly:open-chat", handler);
    return () => document.removeEventListener("shoutly:open-chat", handler);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs, chatLoading]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim();
    setChatInput("");
    setChatMsgs(p => [...p, { type: "user", text: q }]);
    setChatLoading(true);
    try {
      const r = await fetch(API_ENDPOINTS.ragChat, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ query: q, topK: 5 }),
      });
      const d = await r.json();
      setChatMsgs(p => [...p, { type: "bot", text: r.ok && d.success ? d.answer : "Sorry, something went wrong. Please try again." }]);
    } catch {
      setChatMsgs(p => [...p, { type: "bot", text: "Couldn't connect. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!chatOpen) return null;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 28, zIndex: 999, width: 340, display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.15), 0 8px 20px rgba(249,115,22,.1)", border: "1px solid #FED7AA", animation: "chatSlideUp .22s ease-out" }}>
      <style>{`@keyframes chatSlideUp{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}} @keyframes typingDot{0%,60%,100%{opacity:.3}30%{opacity:1}}`}</style>
      <div style={{ background: GRAD, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <span style={{ width: 15, height: 15, color: "#fff" }}>{chatIcon}</span>
        </span>
        <span style={{ flex: 1 }}>
          <b style={{ fontSize: ".85rem", color: "#fff", display: "block", lineHeight: 1.2 }}>Shoutly AI</b>
          <span style={{ fontSize: ".69rem", color: "rgba(255,255,255,.8)" }}>Online · replies instantly</span>
        </span>
        <button onClick={() => setChatOpen(false)} style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,.2)", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1, display: "grid", placeItems: "center" }} title="Close">×</button>
      </div>
      <div className="chat-scroll" style={{ height: 320, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 9, background: "#fff" }}>
        {chatMsgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.type === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "82%", padding: "8px 11px", borderRadius: m.type === "user" ? "13px 13px 3px 13px" : "13px 13px 13px 3px", background: m.type === "user" ? GRAD : "#F3F4F6", color: m.type === "user" ? "#fff" : "#111827", fontSize: ".8rem", lineHeight: 1.55 }}>
              {m.text}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "9px 13px", borderRadius: "13px 13px 13px 3px", background: "#F3F4F6", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#F97316", display: "inline-block", animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div style={{ padding: "9px 11px", borderTop: "1px solid #F3F4F6", display: "flex", gap: 8, alignItems: "center", background: "#fff" }}>
        <input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
          placeholder="Type a message…"
          disabled={chatLoading}
          autoFocus
          style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 9, padding: "7px 11px", fontSize: ".8rem", fontFamily: "inherit", outline: "none", background: "#F9FAFB", color: "#111827", minWidth: 0 }}
        />
        <button
          onClick={sendChat}
          disabled={chatLoading || !chatInput.trim()}
          style={{ width: 34, height: 34, borderRadius: 9, background: GRAD, border: "none", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0, opacity: chatLoading || !chatInput.trim() ? 0.45 : 1, transition: "opacity .15s" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9l20-7Z" /></svg>
        </button>
      </div>
    </div>
  );
}
