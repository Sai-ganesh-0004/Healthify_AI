const navItems = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "symptoms", icon: "🩺", label: "Symptom Checker" },
  { id: "chatbot", icon: "🤖", label: "AI Chatbot" },
  { id: "diet", icon: "🥗", label: "Diet & Nutrition" },
  { id: "reports", icon: "📋", label: "Health Reports" },
  { id: "doctors", icon: "👨‍⚕️", label: "Find Doctors" },
];

export default function Sidebar({ currentPage, navigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Main Menu</div>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item ${currentPage === item.id ? "active" : ""}`}
            onClick={() => navigate(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}