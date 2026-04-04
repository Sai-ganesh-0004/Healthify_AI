import { useState } from "react";
import { registerUser } from "../services/api";

export default function Register({ navigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    sleep: "7",
    exercise: "3",
    smoker: "0",
    alcohol: "0",
    diabetic: "0",
    heart_disease: "0",
    goal: "maintain",
    diet: "both",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(form);
      navigate("login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
          <p>Create your health profile</p>
        </div>

        <div className="auth-tabs">
          <button className="auth-tab" onClick={() => navigate("login")}>
            Sign In
          </button>
          <button className="auth-tab active">Sign Up</button>
        </div>

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            className="form-input"
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
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
          <label className="form-label">Password *</label>
          <input
            className="form-input"
            type="password"
            name="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              className="form-input"
              type="number"
              name="age"
              placeholder="25"
              value={form.age}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-input"
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div className="form-group">
            <label className="form-label">Height (cm)</label>
            <input
              className="form-input"
              type="number"
              name="height"
              placeholder="170"
              value={form.height}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input
              className="form-input"
              type="number"
              name="weight"
              placeholder="70"
              value={form.weight}
              onChange={handleChange}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div className="form-group">
            <label className="form-label">Sleep (hours/day)</label>
            <input
              className="form-input"
              type="number"
              name="sleep"
              min="0"
              max="24"
              value={form.sleep}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Exercise (days/week)</label>
            <input
              className="form-input"
              type="number"
              name="exercise"
              min="0"
              max="7"
              value={form.exercise}
              onChange={handleChange}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div className="form-group">
            <label className="form-label">Smoking</label>
            <select
              className="form-input"
              name="smoker"
              value={form.smoker}
              onChange={handleChange}
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Alcohol (drinks/week)</label>
            <input
              className="form-input"
              type="number"
              name="alcohol"
              min="0"
              value={form.alcohol}
              onChange={handleChange}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div className="form-group">
            <label className="form-label">Diabetic</label>
            <select
              className="form-input"
              name="diabetic"
              value={form.diabetic}
              onChange={handleChange}
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Heart Disease</label>
            <select
              className="form-input"
              name="heart_disease"
              value={form.heart_disease}
              onChange={handleChange}
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div className="form-group">
            <label className="form-label">Primary Goal</label>
            <select
              className="form-input"
              name="goal"
              value={form.goal}
              onChange={handleChange}
            >
              <option value="maintain">Maintain</option>
              <option value="weightloss">Lose Weight</option>
              <option value="gain muscle">Gain Muscle</option>
              <option value="gain weight">Gain Weight</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Diet Preference</label>
            <select
              className="form-input"
              name="diet"
              value={form.diet}
              onChange={handleChange}
            >
              <option value="both">Both</option>
              <option value="veg">Vegetarian</option>
              <option value="nonveg">Non-Vegetarian</option>
            </select>
          </div>
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
          {loading ? "Creating account..." : "Create Account →"}
        </button>

        <div className="auth-switch">
          Already have an account?{" "}
          <a onClick={() => navigate("login")}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
