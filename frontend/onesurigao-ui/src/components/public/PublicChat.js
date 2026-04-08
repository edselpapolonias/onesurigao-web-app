import React, { useState, useRef, useEffect } from "react";
import Layout from "../ReusableBar/PublicLayoutModern";
import { apiClient } from "../../services/authService";
import { usePublicAuth } from "../ReusableBar/SurigaoHeader";
import ReactMarkdown from "react-markdown";

// Design System Tokens (Mapped from the system's modern style)
const DS = {
  primary: "#2B6CB0",
  primaryLight: "#EBF4FF",
  primaryGrad: "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  accent: "#66B7F0",
  accentSoft: "#E7F2FF",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#1A202C",
  textSecondary: "#4A5568",
  textMuted: "#718096",
  shadow: "0 10px 26px rgba(15,23,42,0.07)",
  shadowHover: "0 16px 34px rgba(15,23,42,0.11)",
  font: "'Segoe UI', system-ui, -apple-system, sans-serif",
};

// Icons (SVG)
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const HistoryIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13a9 9 0 1 0 2.13-5.36L3 8" /><path d="M12 7v5l3 2" /></svg>);
const HelpIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);
const ClipIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-8.49 8.49a6 6 0 1 1-8.49-8.49l9.19-9.19a4 4 0 1 1 5.66 5.66l-9.2 9.19a2 2 0 1 1-2.83-2.83l8.49-8.48" /></svg>);
const MicIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" /></svg>);

const PublicChat = () => {
  const { user } = usePublicAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (customMsg = null) => {
    const userMsg = customMsg || input.trim();
    if (!userMsg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await apiClient.post("/public/chatbot/", { query: userMsg });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.text }]);
    } catch (err) {
      console.error("Chatbot Error:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.detail || err.message || "Connection failed";
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `Error: ${errMsg}. Please ensure the backend server is running and the API key is valid.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { label: "📢 Latest Announcements", query: "What are the latest announcements for today?" },
    { label: "📅 Upcoming Events", query: "Can you list any upcoming events in Surigao City?" },
    { label: "📞 Emergency Hotlines", query: "Give me all the emergency hotlines." },
  ];

  suggestions.splice(
    0,
    suggestions.length,
    { label: "What are today's announcements?", query: "What are the latest announcements for today?" },
    { label: "Show upcoming city events", query: "Can you list any upcoming events in Surigao City?" },
    { label: "Find emergency hotlines", query: "Give me all the emergency hotlines." },
    { label: "Which office handles health concerns?", query: "Which office should I contact for health concerns?" }
  );

  return (
    <Layout>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes pulseDot { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>

      <div style={{ maxWidth: "920px", margin: "0 auto", height: "calc(100vh - 162px)", display: "flex", flexDirection: "column", background: DS.card, borderRadius: "20px", boxShadow: DS.shadow, overflow: "hidden", animation: "slideIn 0.4s ease-out" }}>
        
        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${DS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#fff", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: DS.primaryGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(43,108,176,0.3)", flexShrink: 0 }}>
              <BotIcon />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: DS.textPrimary, fontFamily: DS.font }}>OneSurigao AI</div>
              <div style={{ fontSize: 12, color: "#10B981", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, fontFamily: DS.font }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", animation: "pulseDot 2s infinite" }}></span>
                Online
              </div>
              <div style={{ fontSize: 11.5, color: DS.textMuted, fontFamily: DS.font, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                City assistant for announcements, events, and offices
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={() => { if (!loading) { setMessages([]); setInput(""); } }} style={{ border: "none", background: "#F8FAFC", borderRadius: 10, padding: "7px 10px", fontSize: 12, fontWeight: 700, color: DS.textSecondary, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: DS.font }}><PlusIcon /> New Chat</button>
            <button style={{ border: "none", background: "#F8FAFC", borderRadius: 10, padding: "7px 10px", fontSize: 12, fontWeight: 700, color: DS.textSecondary, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: DS.font }}><HistoryIcon /> History</button>
            <button style={{ border: "none", background: "#F8FAFC", borderRadius: 10, padding: "7px 10px", fontSize: 12, fontWeight: 700, color: DS.textSecondary, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: DS.font }}><HelpIcon /> Help</button>
          </div>
        </div>

        {/* Chat Feed */}
        <div ref={scrollRef} className="chat-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 18px 12px", display: "flex", flexDirection: "column", gap: 14, background: "#F8FAFC" }}>
          
          {/* Welcome Message Cards */}
          {!messages.length && (
            <div style={{ marginBottom: 8, marginTop: 8, animation: "fadeIn 0.6s ease" }}>
              <div style={{ background: "#fff", borderRadius: 18, padding: "18px 18px 16px", boxShadow: "0 8px 20px rgba(15,23,42,0.05)" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: DS.textPrimary, fontFamily: DS.font }}>Hi, I&apos;m OneSurigao AI</div>
                <div style={{ marginTop: 5, fontSize: 14, color: DS.textSecondary, fontFamily: DS.font }}>
                  Ask about announcements, events, hotlines, and city offices.
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: DS.textMuted, fontWeight: 600, marginTop: 12, marginBottom: 10, marginLeft: 4 }}>Try asking:</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                {suggestions.map((s, idx) => (
                  <button key={idx} onClick={() => handleSend(s.query)} style={{ background: "#fff", border: "none", borderRadius: 12, padding: "11px 13px", textAlign: "left", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 10px rgba(15,23,42,0.05)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = DS.shadow; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(15,23,42,0.05)"; }}>
                    <div style={{ fontSize: 12.8, fontWeight: 700, color: DS.primary, fontFamily: DS.font }}>{s.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "flex-end", gap: 8, justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "slideIn 0.3s ease-out" }}>
              {m.role === "ai" && <div style={{ width: 30, height: 30, borderRadius: "50%", background: DS.primaryGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><BotIcon /></div>}
              <div style={{ maxWidth: "74%" }}>
                <div style={{ padding: "11px 14px", borderRadius: 18, background: m.role === "user" ? "#E7F2FF" : "#fff", color: DS.textPrimary, boxShadow: "0 4px 12px rgba(15,23,42,0.05)", border: m.role === "ai" ? `1px solid ${DS.border}` : "none", fontSize: 14, lineHeight: 1.62, fontFamily: DS.font }}>
                  <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} style={{ display: "block", marginBottom: 8 }} /> }}>
                    {m.text}
                  </ReactMarkdown>
                </div>
                <div style={{ fontSize: 11, color: DS.textMuted, marginTop: 4, textAlign: m.role === "user" ? "right" : "left", padding: "0 4px", fontFamily: DS.font }}>
                  {m.role === "user" ? (user?.name || "Citizen") : "OneSurigao AI"}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, alignSelf: "flex-start", animation: "fadeIn 0.3s" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: DS.primaryGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><BotIcon /></div>
              <div style={{ padding: "10px 14px", borderRadius: 18, background: "#fff", border: `1px solid ${DS.border}`, display: "flex", gap: 5 }}>
                {[0.1, 0.2, 0.3].map((delay) => (
                  <span key={delay} style={{ width: 6, height: 6, borderRadius: "50%", background: DS.primary, opacity: 0.6, animation: `bounce 1s infinite ${delay}s` }}></span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ position: "sticky", bottom: 0, padding: "10px 14px 8px", borderTop: `1px solid ${DS.border}`, background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", borderRadius: 999, padding: "8px 8px 8px 10px" }}>
            <button style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#E7F2FF", color: DS.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><ClipIcon /></button>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Message OneSurigao AI..." style={{ flex: 1, border: "none", fontSize: 14, background: "transparent", color: DS.textPrimary, outline: "none", resize: "none", minHeight: 24, maxHeight: 110, fontFamily: DS.font, lineHeight: 1.5, paddingTop: 6 }} />
            <button style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#EEF2F7", color: DS.textMuted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><MicIcon /></button>
            <button onClick={() => handleSend()} disabled={!input.trim() || loading} style={{ width: 36, height: 36, borderRadius: "50%", background: !input.trim() || loading ? "#CBD5E1" : DS.primary, color: "#fff", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: input.trim() && !loading ? "0 4px 12px rgba(37,99,235,0.25)" : "none", flexShrink: 0 }}>
              <SendIcon />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 7, color: DS.textMuted, fontSize: 11, fontFamily: DS.font }}>
            <InfoIcon /> AI may be inaccurate. Please confirm urgent details with local offices.
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PublicChat;
