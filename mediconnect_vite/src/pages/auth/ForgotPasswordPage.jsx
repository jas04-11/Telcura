import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import api from "../../utils/api.js";
import toast from "react-hot-toast";
import "./Auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset email sent!");
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand"><div className="landing-logo-icon"><FiHeart size={18} /></div><span>Telcura</span></div>
        <h1>Reset Your Password</h1>
        <p>Enter your registered email and we'll send you a secure link to reset your password.</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <h2 className="auth-title">Check Your Email</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>We've sent a password reset link to <strong>{email}</strong>. Check your inbox (and spam folder).</p>
              <Link to="/login" className="btn btn-primary btn-full">Back to Login</Link>
            </div>
          ) : (
            <>
              <h2 className="auth-title">Forgot Password?</h2>
              <p className="auth-subtitle">No worries, we'll send you reset instructions.</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</button>
              </form>
              <p className="auth-footer"><Link to="/login">← Back to Login</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
