import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiVideo, FiMessageCircle, FiShield, FiStar, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import "./LandingPage.css";

const specializations = [
  { icon: "🫀", name: "Cardiologist" }, { icon: "🧠", name: "Neurologist" },
  { icon: "🦷", name: "Dentist" }, { icon: "👁️", name: "Ophthalmologist" },
  { icon: "🦴", name: "Orthopedist" }, { icon: "🧬", name: "Dermatologist" },
  { icon: "👶", name: "Pediatrician" }, { icon: "🧘", name: "Psychiatrist" },
];

const features = [
  { icon: <FiVideo size={24} />, title: "Video Consultation", desc: "Connect with doctors via HD video call from the comfort of your home.", color: "#e0f4fb" },
  { icon: <FiMessageCircle size={24} />, title: "Real-time Chat", desc: "Chat live with your doctor during consultations for quick clarifications.", color: "#d1fae5" },
  { icon: <FiShield size={24} />, title: "AI Symptom Checker", desc: "Describe your symptoms and get instant specialist recommendations.", color: "#fef3c7" },
  { icon: <FiHeart size={24} />, title: "Health Records", desc: "All your prescriptions, reports and medical history in one secure place.", color: "#fee2e2" },
];

const stats = [
  { value: "10,000+", label: "Patients Served" },
  { value: "500+", label: "Expert Doctors" },
  { value: "50+", label: "Specializations" },
  { value: "4.9★", label: "Average Rating" },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="container landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon"><FiHeart size={16} /></div>
            <span>Telcura</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#specializations">Specializations</a>
            <a href="#how-it-works">How It Works</a>
          </div>
          <div className="landing-nav-cta">
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
        </div>
        <div className="container landing-hero-inner">
          <div className="landing-hero-content animate-fade-in">
            <div className="hero-badge">
              <span className="online-dot" style={{ width: 8, height: 8 }} />
              &nbsp; 500+ Doctors Available Now
            </div>
            <h1 className="hero-title">
              Healthcare <span className="hero-highlight">At Your Fingertips</span>
            </h1>
            <p className="hero-subtitle">
              Consult top-rated doctors online via video or chat. Get real prescriptions, AI-powered symptom analysis, and complete health records — all in one place.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Consultation <FiArrowRight />
              </Link>
              <Link to="/register?role=doctor" className="btn btn-outline btn-lg">
                Join as Doctor
              </Link>
            </div>
            <div className="hero-checks">
              {["No waiting rooms", "Verified doctors", "Secure & private"].map((t) => (
                <div key={t} className="hero-check"><FiCheckCircle color="var(--accent)" /> {t}</div>
              ))}
            </div>
          </div>
          <div className="landing-hero-visual animate-fade-in">
            <div className="hero-card-main">
              <div className="hero-card-header">
                <div className="avatar avatar-md" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 18 }}>DR</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>Dr. Priya Sharma</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Cardiologist · 12 yrs exp</p>
                </div>
                <div className="online-dot" style={{ marginLeft: "auto" }} />
              </div>
              <div className="hero-stars">
                {"★★★★★".split("").map((s, i) => <span key={i} style={{ color: "#f59e0b" }}>{s}</span>)}
                <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: 4 }}>4.9 (328 reviews)</span>
              </div>
              <div className="hero-consult-types">
                <span className="badge badge-primary">📹 Video</span>
                <span className="badge badge-success">💬 Chat</span>
                <span className="badge badge-warning">🏥 In-Clinic</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Consultation Fee</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>₹500</p>
                </div>
                <button className="btn btn-primary btn-sm">Book Now</button>
              </div>
            </div>

            <div className="hero-card-float hero-card-float-1">
              <FiShield size={16} color="var(--primary)" />
              <span>AI Diagnosis Ready</span>
            </div>
            <div className="hero-card-float hero-card-float-2">
              <FiHeart size={16} color="var(--danger)" />
              <span>Health Score: 85%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="stat-item">
                <p className="stat-item-value">{s.value}</p>
                <p className="stat-item-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="section-title" style={{ fontSize: 32 }}>Everything You Need</h2>
            <p className="section-subtitle" style={{ fontSize: 16 }}>A complete digital healthcare platform built for the real world</p>
          </div>
          <div className="grid-4">
            {features.map((f) => (
              <div key={f.title} className="card card-hover feature-card">
                <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, margin: "12px 0 6px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="landing-specs" id="specializations">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 className="section-title" style={{ fontSize: 32 }}>50+ Specializations</h2>
            <p className="section-subtitle">Find the right specialist for your health needs</p>
          </div>
          <div className="specs-grid">
            {specializations.map((s) => (
              <div key={s.name} className="spec-card">
                <span className="spec-icon">{s.icon}</span>
                <span className="spec-name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-how" id="how-it-works">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="section-title" style={{ fontSize: 32 }}>How It Works</h2>
          </div>
          <div className="grid-3 how-grid">
            {[
              { step: "01", title: "Create Account", desc: "Sign up as a patient in under 2 minutes. No paperwork required." },
              { step: "02", title: "Find & Book Doctor", desc: "Search by symptoms, specialization or name. Book a time slot instantly." },
              { step: "03", title: "Consult & Get Prescription", desc: "Video or chat consultation. Receive digital prescriptions on the spot." },
            ].map((s) => (
              <div key={s.step} className="how-card">
                <div className="how-step">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="container">
          <div className="cta-box">
            <h2>Your Health Can't Wait</h2>
            <p>Join thousands of patients getting expert care from home. First consultation is easy to get started.</p>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ background: "#fff", color: "var(--primary)" }}>
              Get Started for Free <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="landing-logo" style={{ justifyContent: "center", marginBottom: 12 }}>
            <div className="landing-logo-icon"><FiHeart size={14} /></div>
            <span style={{ color: "#fff" }}>Telcura</span>
          </div>
          <p style={{ color: "var(--text-light)", fontSize: 13, textAlign: "center" }}>
            © 2026 Telcura. Your health, our priority. · Not a substitute for emergency medical care.
          </p>
        </div>
      </footer>
    </div>
  );
}
