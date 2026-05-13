// LoginPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiHeart, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";
import "./Auth.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      patient: { email: "patient@demo.com", password: "demo1234" },
      doctor: { email: "doctor@demo.com", password: "demo1234" },
      admin: { email: "admin@demo.com", password: "demo1234" },
    };
    setForm(demos[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="landing-logo-icon"><FiHeart size={18} /></div>
          <span>Telcura</span>
        </div>
        <h1>Healthcare<br />Made Simple</h1>
        <p>Connect with 500+ verified specialists. Get consultations, prescriptions, and complete health management — all online.</p>
        <div className="auth-features">
          {["AI-powered symptom checker", "Real-time video & chat consultation", "Secure digital prescriptions", "Complete health records"].map((f) => (
            <div key={f} className="auth-feature-item">✓ {f}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your Telcura account</p>

          <div className="demo-btns">
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Quick demo login:</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["patient", "doctor", "admin"].map((r) => (
                <button key={r} className="btn btn-secondary btn-sm" onClick={() => fillDemo(r)} style={{ fontSize: 12 }}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input type="email" className="form-input input-with-icon" placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input type={showPassword ? "text" : "password"} className="form-input input-with-icon input-with-icon-right"
                  placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div style={{ textAlign: "right", marginBottom: 20 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: "var(--primary)" }}>Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
