import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiStar } from "react-icons/fi";
import api from "../../utils/api.js";
import toast from "react-hot-toast";
import "./Patient.css";

const QUICK_SYMPTOMS = [
  "Headache","Fever","Chest pain","Cough","Back pain",
  "Stomach pain","Anxiety","Skin rash","Joint pain","Dizziness",
  "Shortness of breath","Eye pain","Sore throat","Fatigue",
];

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  const toggleQuick = (s) => {
    const next = selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s];
    setSelected(next);
    setSymptoms(next.join(", "));
  };

  const handleCheck = async () => {
    if (!symptoms.trim()) return toast.error("Please describe your symptoms");
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/ai/symptom-check", { symptoms, age, gender });
      setResult(data);
    } catch {} finally { setLoading(false); }
  };

  const severityBg = { red: "red", orange: "orange", yellow: "yellow", green: "green" };

  return (
    <div className="symptom-checker animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">AI Symptom Checker</h1>
        <p className="section-subtitle">Describe your symptoms and get instant specialist recommendations powered by AI</p>
      </div>

      {/* Input */}
      <div className="symptom-input-card">
        <h2>What symptoms are you experiencing?</h2>
        <p>Be as descriptive as possible for better analysis</p>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick select</p>
          <div className="quick-symptoms">
            {QUICK_SYMPTOMS.map((s) => (
              <button key={s} className={`quick-symptom-btn ${selected.includes(s) ? "active" : ""}`} onClick={() => toggleQuick(s)}>{s}</button>
            ))}
          </div>
        </div>

        <textarea className="symptom-textarea" rows={4}
          placeholder="E.g.: I have been having severe headache and fever for 2 days, along with nausea and sensitivity to light..."
          value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Age (optional)</label>
            <input type="number" placeholder="e.g. 35" value={age} onChange={(e) => setAge(e.target.value)}
              style={{ padding: "10px 14px", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, fontFamily: "var(--font-body)", width: "100%", outline: "none" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Gender (optional)</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}
              style={{ padding: "10px 14px", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, fontFamily: "var(--font-body)", width: "100%", outline: "none" }}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button className="btn btn-primary btn-lg" onClick={handleCheck} disabled={loading} style={{ minWidth: 180 }}>
              {loading ? "Analyzing..." : "Analyze Symptoms"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-fade-in">
          {/* Severity */}
          <div className={`severity-card ${severityBg[result.analysis.severity.color] || "green"}`}>
            <div style={{ fontSize: 32 }}>
              {result.analysis.severity.color === "red" ? "🚨" : result.analysis.severity.color === "orange" ? "🔴" : result.analysis.severity.color === "yellow" ? "🟡" : "🟢"}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, textTransform: "capitalize" }}>
                {result.analysis.severity.level} Priority
              </p>
              <p style={{ fontSize: 14 }}>{result.analysis.severity.message}</p>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Possible Conditions */}
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Possible Conditions</h3>
              {result.analysis.possibleConditions.map((c, i) => (
                <div key={i} style={{ padding: "12px", background: "var(--bg)", borderRadius: "var(--radius-sm)", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</p>
                    <span className={`badge ${c.probability === "High" ? "badge-warning" : "badge-secondary"}`}>{c.probability}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>→ {c.action}</p>
                </div>
              ))}
            </div>

            {/* Home Remedies & Precautions */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 12 }}>Home Remedies</h3>
                {result.analysis.homeRemedies.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ color: "var(--accent)", fontSize: 14 }}>✓</span>
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{r}</p>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ marginBottom: 12 }}>Precautions</h3>
                {result.analysis.precautions.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ color: "var(--warning)", fontSize: 14 }}>⚠</span>
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Specializations */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12 }}>Recommended Specializations</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {result.analysis.recommendedSpecializations.map((s) => (
                <span key={s} className="badge badge-primary" style={{ fontSize: 13, padding: "6px 14px" }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Recommended Doctors */}
          {result.recommendedDoctors?.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 20 }}>Recommended Doctors</h2>
                <Link to="/patient/find-doctors" className="btn btn-outline btn-sm">View All</Link>
              </div>
              <div className="grid-3">
                {result.recommendedDoctors.slice(0, 6).map((doc) => (
                  <div key={doc._id} className="card card-hover" style={{ padding: 18 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <div className="avatar avatar-sm" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                        {doc.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14 }}>Dr. {doc.user?.name}</p>
                        <p style={{ fontSize: 12, color: "var(--primary)" }}>{doc.specialization}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#f59e0b" }}>
                        <FiStar fill="#f59e0b" size={12} /> {doc.rating}
                      </div>
                      <p style={{ fontWeight: 700, color: "var(--primary)", fontSize: 14 }}>₹{doc.consultationFee}</p>
                    </div>
                    <Link to={`/patient/book/${doc._id}`} className="btn btn-primary btn-sm btn-full" style={{ marginTop: 12 }}>
                      Book Now <FiArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ padding: "14px 18px", background: "#fef3c7", borderRadius: "var(--radius-sm)", border: "1px solid #fde68a", marginTop: 24, fontSize: 13, color: "#92400e" }}>
            ⚠️ <strong>Disclaimer:</strong> {result.analysis.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
