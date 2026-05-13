// HealthRecords.js
import React, { useEffect, useState } from "react";
import api from "../../utils/api.js";
import { format } from "date-fns";

export function HealthRecords() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/health-records").then(({ data }) => setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
      <h1 className="section-title" style={{ marginBottom: 4 }}>Health Records</h1>
      <p className="section-subtitle">Your complete medical history and health information</p>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Basic Info */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>🩸 Basic Health Info</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <InfoRow label="Blood Group" value={data?.healthRecords?.bloodGroup || "Not set"} />
          </div>
          {data?.healthRecords?.allergies?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>⚠️ Allergies</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.healthRecords.allergies.map((a) => <span key={a} className="badge badge-danger">{a}</span>)}
              </div>
            </div>
          )}
          {data?.healthRecords?.currentMedications?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>💊 Current Medications</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.healthRecords.currentMedications.map((m) => <span key={m} className="badge badge-secondary">{m}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Medical History */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📋 Medical History</h3>
          {data?.healthRecords?.medicalHistory?.length > 0 ? data.healthRecords.medicalHistory.map((h, i) => (
            <div key={i} style={{ padding: "12px", background: "var(--bg)", borderRadius: "var(--radius-sm)", marginBottom: 10 }}>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>{h.condition}</p>
              {h.diagnosedDate && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Diagnosed: {format(new Date(h.diagnosedDate), "MMM yyyy")}</p>}
              {h.notes && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{h.notes}</p>}
            </div>
          )) : <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No medical history recorded.</p>}
        </div>
      </div>

      {/* Recent Consultations */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>📅 Recent Consultations</h3>
        {data?.appointments?.length > 0 ? data.appointments.map((a) => (
          <div key={a._id} style={{ display: "flex", gap: 12, padding: "12px", background: "var(--bg)", borderRadius: "var(--radius-sm)", marginBottom: 10 }}>
            <div className="avatar avatar-sm" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
              {a.doctor?.user?.name?.charAt(0)}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Dr. {a.doctor?.user?.name}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{format(new Date(a.appointmentDate), "MMMM dd, yyyy")} · {a.consultationType}</p>
            </div>
          </div>
        )) : <p style={{ color: "var(--text-muted)" }}>No consultations yet.</p>}
      </div>

      {/* Recent Prescriptions */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>💊 Recent Prescriptions</h3>
        {data?.prescriptions?.length > 0 ? data.prescriptions.map((p) => (
          <div key={p._id} style={{ padding: "12px 16px", background: "var(--bg)", borderRadius: "var(--radius-sm)", marginBottom: 10 }}>
            <p style={{ fontWeight: 600 }}>{p.diagnosis}</p>
            <p style={{ fontSize: 13, color: "var(--primary)" }}>Dr. {p.doctor?.user?.name}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{format(new Date(p.createdAt), "MMM dd, yyyy")} · {p.medicines?.length} medicine(s)</p>
          </div>
        )) : <p style={{ color: "var(--text-muted)" }}>No prescriptions yet.</p>}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
    </div>
  );
}

export default HealthRecords;
