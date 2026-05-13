import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiHeart, FiUser, FiMail, FiLock, FiPhone } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";
import "./Auth.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", gender: "",
    role: params.get("role") || "patient",
    // Doctor fields
    specialization: "", experience: "", licenseNumber: "", consultationFee: "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const data = await register(form);
      toast.success("Account created successfully!");
      navigate(`/${data.user.role}/dashboard`);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="landing-logo-icon"><FiHeart size={18} /></div>
          <span>Telcura</span>
        </div>
        <h1>Join India's #1 Telemedicine Platform</h1>
        <p>Whether you're a patient seeking care or a doctor ready to help — Telcura connects you instantly.</p>
        <div className="auth-features">
          {["Free to register", "Verified & trusted platform", "Available 24/7", "Complete data privacy"].map((f) => (
            <div key={f} className="auth-feature-item">✓ {f}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <h2 className="auth-title">Create Account</h2>

          {/* Role toggle */}
          <div className="role-toggle">
            {["patient", "doctor"].map((r) => (
              <button key={r} type="button"
                className={`role-btn ${form.role === r ? "active" : ""}`}
                onClick={() => setForm((f) => ({ ...f, role: r }))}>
                {r === "patient" ? "🧑‍⚕️ Patient" : "👨‍⚕️ Doctor"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Dr. John Smith" value={form.name} onChange={set("name")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={set("password")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={form.gender} onChange={set("gender")}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Doctor-specific fields */}
            {form.role === "doctor" && (
              <>
                <div className="divider-text" style={{ margin: "4px 0 16px" }}>Doctor Information</div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <select className="form-select" value={form.specialization} onChange={set("specialization")} required>
                      <option value="">Select</option>
                      {["General Physician","Cardiologist","Dermatologist","Neurologist","Orthopedist","Pediatrician","Psychiatrist","Gynecologist","ENT Specialist","Ophthalmologist","Urologist","Endocrinologist","Gastroenterologist","Pulmonologist"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input type="number" className="form-input" placeholder="5" min="0" value={form.experience} onChange={set("experience")} required />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">License Number</label>
                    <input className="form-input" placeholder="MCI-12345" value={form.licenseNumber} onChange={set("licenseNumber")} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation Fee (₹)</label>
                    <input type="number" className="form-input" placeholder="500" value={form.consultationFee} onChange={set("consultationFee")} required />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
