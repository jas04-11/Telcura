import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import { format } from "date-fns";

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/prescriptions/patient").then(({ data }) => {
      setPrescriptions(data.prescriptions);
      if (data.prescriptions.length) setSelected(data.prescriptions[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <h1 className="section-title" style={{ marginBottom: 4 }}>My Prescriptions</h1>
      <p className="section-subtitle">All your digital prescriptions in one place</p>

      {prescriptions.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize: 48 }}>💊</div><h3>No prescriptions yet</h3></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {prescriptions.map((p) => (
              <div key={p._id} onClick={() => setSelected(p)}
                style={{ padding: "14px 16px", background: "#fff", borderRadius: "var(--radius-sm)", border: `2px solid ${selected?._id === p._id ? "var(--primary)" : "var(--border)"}`,
                  cursor: "pointer", transition: "all 0.2s", boxShadow: selected?._id === p._id ? "var(--shadow)" : "none" }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Rx: {p.diagnosis}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Dr. {p.doctor?.user?.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>{format(new Date(p.createdAt), "MMM dd, yyyy")}</p>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="card prescription-card animate-fade-in">
              {/* Header */}
              <div className="rx-header">
                <div className="rx-symbol">℞</div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 20, marginBottom: 4 }}>Medical Prescription</h2>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Date: {format(new Date(selected.createdAt), "MMMM dd, yyyy")}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 700 }}>Dr. {selected.doctor?.user?.name}</p>
                  <p style={{ fontSize: 13, color: "var(--primary)" }}>{selected.doctor?.specialization}</p>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: 20 }}>
                <div style={{ padding: "12px 16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>DIAGNOSIS</p>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>{selected.diagnosis}</p>
                </div>
                {selected.followUpDate && (
                  <div style={{ padding: "12px 16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>FOLLOW-UP DATE</p>
                    <p style={{ fontWeight: 700 }}>{format(new Date(selected.followUpDate), "MMMM dd, yyyy")}</p>
                  </div>
                )}
              </div>

              {/* Medicines */}
              <h3 style={{ marginBottom: 14 }}>💊 Prescribed Medicines</h3>
              {selected.medicines?.map((m, i) => (
                <div key={i} className="medicine-item">
                  <div className="medicine-dot" />
                  <div>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>{m.name}</p>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--text-muted)" }}>
                      {m.dosage && <span>Dosage: <strong>{m.dosage}</strong></span>}
                      {m.frequency && <span>Frequency: <strong>{m.frequency}</strong></span>}
                      {m.duration && <span>Duration: <strong>{m.duration}</strong></span>}
                    </div>
                    {m.instructions && <p style={{ fontSize: 13, color: "var(--text-light)", marginTop: 4 }}>📝 {m.instructions}</p>}
                  </div>
                </div>
              ))}

              {/* Tests */}
              {selected.tests?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ marginBottom: 12 }}>🔬 Recommended Tests</h3>
                  {selected.tests.map((t, i) => (
                    <div key={i} style={{ padding: "10px 14px", background: "#fef3c7", borderRadius: "var(--radius-sm)", marginBottom: 8, border: "1px solid #fde68a" }}>
                      <p style={{ fontWeight: 600 }}>{t.name}</p>
                      {t.instructions && <p style={{ fontSize: 13, color: "#92400e" }}>{t.instructions}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Advice */}
              {selected.advice && (
                <div style={{ marginTop: 20, padding: "16px", background: "#f0fdf4", borderRadius: "var(--radius-sm)", border: "1px solid #86efac" }}>
                  <p style={{ fontWeight: 600, marginBottom: 6 }}>👨‍⚕️ Doctor's Advice</p>
                  <p style={{ fontSize: 14, color: "#166534" }}>{selected.advice}</p>
                </div>
              )}

              <div style={{ marginTop: 20, padding: "12px", background: "var(--bg)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-muted)" }}>
                ⚠️ This prescription is digitally verified. Take medicines only as prescribed. Contact your doctor for any concerns.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
