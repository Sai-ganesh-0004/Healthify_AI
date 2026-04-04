import { useState } from "react";
import { loginUser } from "../services/api";

export default function Login({ navigate, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password.trim().replace(/^"(.*)"$/, "$1"),
      };
      const data = await loginUser(payload);
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🏥</div>
          <h1>Healthify AI</h1>
          <p>Your personal health assistant</p>
        </div>

        <div className="auth-tabs">
          <button className="auth-tab active">Sign In</button>
          <button className="auth-tab" onClick={() => navigate("register")}>
            Sign Up
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {error && (
          <div
            style={{
              color: "var(--danger)",
              fontSize: "0.85rem",
              marginBottom: "12px",
            }}
          >
            {error}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <div className="auth-switch">
          Don't have an account?{" "}
          <a onClick={() => navigate("register")}>Create one</a>
        </div>
      </div>
    </div>
  );
}
