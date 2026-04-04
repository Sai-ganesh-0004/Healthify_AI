export default function ChatMessage({ message }) {
  const isAI = message.role === "ai";

  return (
    <div className={`message ${isAI ? "ai" : "user"}`}>
      <div className={`msg-avatar ${isAI ? "ai" : "user"}`}>
        {isAI ? "🤖" : "👤"}
      </div>
      <div className="msg-bubble">
        {message.text}
        <div style={{
          fontSize: "0.72rem",
          color: "var(--text3)",
          marginTop: "6px",
          textAlign: isAI ? "left" : "right"
        }}>
          {message.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}