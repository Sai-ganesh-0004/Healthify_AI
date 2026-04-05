import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import ObesityChart from "../components/ObesityChart";
import WeightTrendChart from "../components/WeightTrendChart";
import {
  getChatInsights,
  getUserProfile,
  sendChatMessage,
} from "../services/api";

const STORAGE_KEY_PREFIX = "healthai_chat_sessions";

const SUGGESTIONS = [
  "What should I eat if I have a headache?",
  "How can I improve my sleep quality?",
  "What does vitamin D deficiency feel like?",
  "Tips for staying hydrated",
];

const INITIAL_MSG = {
  id: 1,
  role: "ai",
  text: "Hello! I'm your Healthify AI Companion. I can now generate personalized health guidance, meal suggestions, workout tips, and predictive health insights inside this chat. How can I help you today?",
};

const newSession = (name) => ({
  id: Date.now(),
  name:
    name ||
    `Chat ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
  messages: [INITIAL_MSG],
  insights: null,
  createdAt: new Date().toISOString(),
});

const hydrateSessions = (rawSessions = []) => {
  const sessions = (rawSessions || []).map((session) => ({
    ...session,
    messages: session.messages?.length ? session.messages : [INITIAL_MSG],
    insights: session.insights || null,
  }));

  return sessions.length > 0 ? sessions : [newSession("New Chat")];
};

const loadSessions = (storageKey) => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return hydrateSessions(JSON.parse(stored));
    }
  } catch {}

  return [newSession("New Chat")];
};

const saveSessions = (storageKey, sessions) => {
  localStorage.setItem(storageKey, JSON.stringify(sessions));
};

const normalizeProfile = (profile = {}) => ({
  ...profile,
  age: Number(profile.age) || 25,
  height: Number(profile.height) || 170,
  weight: Number(profile.weight) || 70,
  sleep: Number(profile.sleep) || 7,
  exercise: Number(profile.exercise) || 3,
  smoker: Number(profile.smoker) === 1 ? 1 : 0,
  alcohol: Number(profile.alcohol) || 0,
  goal: profile.goal || "maintain",
  diet: profile.diet || "both",
});

const riskCardTone = (risk) => {
  if (risk === "Obese") return "danger";
  if (risk === "Overweight") return "warn";
  return "safe";
};

const bmiToRisk = (bmi) => {
  const value = Number(bmi);
  if (!Number.isFinite(value)) return "Unknown";
  if (value >= 30) return "Obese";
  if (value >= 25) return "Overweight";
  if (value >= 18.5) return "Normal";
  return "Underweight";
};

export default function Chatbot({ user }) {
  const chatStorageKey = useMemo(() => {
    const identity = user?._id || user?.email || "anonymous";
    return `${STORAGE_KEY_PREFIX}_${String(identity).toLowerCase()}`;
  }, [user?._id, user?.email]);

  const [sessions, setSessions] = useState(() => [newSession("New Chat")]);
  const [activeId, setActiveId] = useState(() => Date.now());
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [insightsLoadingId, setInsightsLoadingId] = useState(null);
  const [profile, setProfile] = useState(normalizeProfile(user));
  const [storageReady, setStorageReady] = useState(false);
  const bottomRef = useRef(null);

  const activeSession = sessions.find((s) => s.id === activeId) || sessions[0];
  const messages = useMemo(
    () => activeSession?.messages || [INITIAL_MSG],
    [activeSession],
  );

  useEffect(() => {
    const loaded = loadSessions(chatStorageKey);
    setSessions(loaded);
    setActiveId(loaded[0].id);
    setStorageReady(true);
  }, [chatStorageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, activeSession?.insights]);

  useEffect(() => {
    if (!storageReady) return;
    saveSessions(chatStorageKey, sessions);
  }, [chatStorageKey, sessions, storageReady]);

  useEffect(() => {
    let ignore = false;

    getUserProfile()
      .then((data) => {
        if (ignore) return;
        setProfile((prev) => normalizeProfile({ ...prev, ...data.user }));
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [user?._id, user?.email]);

  const updateSession = (sessionId, updater) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        return typeof updater === "function"
          ? updater(session)
          : { ...session, ...updater };
      }),
    );
  };

  const updateMessages = (sessionId, newMessages) => {
    updateSession(sessionId, { messages: newMessages });
  };

  const fetchInsights = async (sessionId, messageText) => {
    setInsightsLoadingId(sessionId);

    try {
      // Always use the latest persisted profile to avoid stale graph data.
      let profileForInsights = profile;
      try {
        const latest = await getUserProfile();
        const normalizedLatest = normalizeProfile({
          ...profile,
          ...latest?.user,
        });
        profileForInsights = normalizedLatest;
        setProfile(normalizedLatest);
      } catch {}

      const data = await getChatInsights({
        userProfile: profileForInsights,
        message: messageText,
      });
      updateSession(sessionId, { insights: data });
    } catch {
      updateSession(sessionId, { insights: null });
    } finally {
      setInsightsLoadingId((current) =>
        current === sessionId ? null : current,
      );
    }
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    const currentSession = activeSession;
    const currentMessages = currentSession?.messages || [INITIAL_MSG];
    const firstUserMessage =
      currentMessages.filter((message) => message.role === "user").length === 0;
    const userMsg = { id: Date.now(), role: "user", text: userText };
    const updatedMsgs = [...currentMessages, userMsg];
    updateMessages(activeId, updatedMsgs);
    setInput("");
    setIsTyping(true);

    // Auto rename session from first user message
    if (currentMessages.length === 1) {
      updateSession(activeId, {
        name: userText.slice(0, 30) + (userText.length > 30 ? "..." : ""),
      });
    }

    try {
      const responsePromise = sendChatMessage({
        message: userText,
        userProfile: profile,
        isFirstMessage: firstUserMessage,
      });

      // Refresh insights for each message so charts track latest profile state.
      fetchInsights(activeId, userText);

      const response = await responsePromise;
      const aiMsg = { id: Date.now() + 1, role: "ai", text: response.message };
      updateMessages(activeId, [...updatedMsgs, aiMsg]);
    } catch {
      updateMessages(activeId, [
        ...updatedMsgs,
        {
          id: Date.now() + 1,
          role: "ai",
          text: "I'm having trouble connecting right now. Please make sure the backend server is running.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    const session = newSession("New Chat");
    setSessions((prev) => [session, ...prev]);
    setActiveId(session.id);
    setInput("");
  };

  const handleDeleteSession = (id) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (updated.length === 0) {
        const fresh = newSession("New Chat");
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(updated[0].id);
      return updated;
    });
  };

  const handleRename = (id) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    updateSession(id, { name: editName.trim() });
    setEditingId(null);
    setEditName("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const insights = activeSession?.insights;
  const projectedWeight = useMemo(() => {
    const weightData = insights?.projections?.weightData;
    if (Array.isArray(weightData) && weightData.length > 0) {
      const lastPoint = weightData[weightData.length - 1];
      const value = Number(lastPoint?.withPlan);
      if (Number.isFinite(value)) return value;
    }

    const fallback = Number(insights?.predictions?.predicted_weight);
    return Number.isFinite(fallback) ? fallback : null;
  }, [insights]);

  const projectedObesityRisk = useMemo(() => {
    const obesityData = insights?.projections?.obesityData;
    if (Array.isArray(obesityData) && obesityData.length > 0) {
      const lastPoint = obesityData[obesityData.length - 1];
      return bmiToRisk(lastPoint?.withPlan);
    }

    return insights?.predictions?.obesity_risk || "Unknown";
  }, [insights]);

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 120px)",
        gap: 0,
        overflow: "hidden",
        background: "var(--bg2)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
      }}
    >
      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <div
          style={{
            width: "260px",
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            background: "var(--card)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Sidebar Header */}
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--text)",
              }}
            >
              🤖 Chats
            </span>
            <button
              onClick={handleNewChat}
              title="New Chat"
              style={{
                background: "var(--accent)",
                border: "none",
                borderRadius: "6px",
                width: "28px",
                height: "28px",
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: 700,
              }}
            >
              +
            </button>
          </div>

          {/* Sessions List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setActiveId(s.id);
                  setInput("");
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "4px",
                  background:
                    s.id === activeId ? "rgba(0,212,170,0.1)" : "transparent",
                  border: `1px solid ${s.id === activeId ? "rgba(0,212,170,0.3)" : "transparent"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>💬</span>

                {editingId === s.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(s.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => handleRename(s.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      background: "var(--bg)",
                      border: "1px solid var(--accent)",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      color: "var(--text)",
                      fontSize: "0.82rem",
                      outline: "none",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      flex: 1,
                      fontSize: "0.82rem",
                      color:
                        s.id === activeId ? "var(--accent)" : "var(--text2)",
                      fontWeight: s.id === activeId ? 600 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.name}
                  </span>
                )}

                {/* Actions */}
                <div
                  style={{ display: "flex", gap: "2px", flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    title="Rename"
                    onClick={() => {
                      setEditingId(s.id);
                      setEditName(s.name);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text3)",
                      fontSize: "0.75rem",
                      padding: "2px 3px",
                      opacity: s.id === activeId ? 1 : 0.4,
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    title="Delete"
                    onClick={() => handleDeleteSession(s.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text3)",
                      fontSize: "0.75rem",
                      padding: "2px 3px",
                      opacity: s.id === activeId ? 1 : 0.4,
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Session count */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid var(--border)",
              fontSize: "0.72rem",
              color: "var(--text3)",
              textAlign: "center",
            }}
          >
            {sessions.length} conversation{sessions.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* ── Main Chat Area ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--card)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle sidebar"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "4px 8px",
              cursor: "pointer",
              color: "var(--text2)",
              fontSize: "0.85rem",
            }}
          >
            ☰
          </button>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "var(--text)",
              }}
            >
              {activeSession?.name || "New Chat"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text3)" }}>
              {messages.length - 1} messages
            </div>
          </div>
          <button
            onClick={handleNewChat}
            style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: "6px",
              padding: "6px 14px",
              cursor: "pointer",
              color: "#000",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            + New Chat
          </button>
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              borderBottom: "1px solid var(--border)",
              background: "var(--card)",
              flexShrink: 0,
            }}
          >
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="btn-secondary"
                style={{ fontSize: "0.78rem", padding: "5px 12px" }}
                onClick={() => sendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
          {insightsLoadingId === activeId && (
            <div className="chat-insights-loading">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span>Generating personalized health insights...</span>
            </div>
          )}

          {insights && (
            <div className="chat-insights-panel">
              <div className="chat-insights-grid">
                <div className="chat-insight-card">
                  <div className="chat-insight-label">Predicted Weight</div>
                  <div className="chat-insight-value">
                    {projectedWeight !== null ? `${projectedWeight} kg` : "--"}
                  </div>
                </div>
                <div
                  className={`chat-insight-card ${riskCardTone(projectedObesityRisk)}`}
                >
                  <div className="chat-insight-label">Obesity Risk</div>
                  <div className="chat-insight-value">
                    {projectedObesityRisk}
                  </div>
                </div>
                <div className="chat-insight-card">
                  <div className="chat-insight-label">Health Score</div>
                  <div className="chat-insight-value">
                    {insights.predictions?.health_score}/10
                  </div>
                </div>
                <div className="chat-insight-card">
                  <div className="chat-insight-label">BMI</div>
                  <div className="chat-insight-value">
                    {insights.context?.bmiData?.bmi} (
                    {insights.context?.bmiData?.category})
                  </div>
                </div>
              </div>

              <div className="chat-insights-grid charts">
                <WeightTrendChart data={insights.projections?.weightData} />
                <ObesityChart data={insights.projections?.obesityData} />
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className={`msg-avatar ${msg.role}`}>
                {msg.role === "ai" ? "🤖" : "👤"}
              </div>
              <div
                className={`msg-bubble ${msg.role === "ai" ? "markdown-bubble" : ""}`}
              >
                {msg.role === "ai" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message ai">
              <div className="msg-avatar ai">🤖</div>
              <div className="msg-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area" style={{ flexShrink: 0 }}>
          <input
            className="chat-input"
            placeholder="Ask about symptoms, diet, workouts, or health tips..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
