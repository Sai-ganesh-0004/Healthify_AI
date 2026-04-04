export default function Navbar({ user, onLogout, navigate }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span>🏥</span>
        <span>
          Healthify <span style={{ color: "var(--accent)" }}>AI</span>
        </span>
      </div>
      <div className="nav-right">
        <div className="nav-user">
          <div className="nav-avatar">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <span className="nav-name">{user?.name || "User"}</span>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
