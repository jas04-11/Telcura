// Admin Dashboard
import React, { useEffect, useState } from "react";
import api from "../../utils/api.js";
import { format } from "date-fns";

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <h1 className="section-title" style={{ marginBottom: 4 }}>Admin Dashboard</h1>
      <p className="section-subtitle">Platform overview and management</p>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: "Total Patients", value: data?.stats?.totalUsers, icon: "👤", color: "#e0f4fb" },
          { label: "Total Doctors", value: data?.stats?.totalDoctors, icon: "👨‍⚕️", color: "#d1fae5" },
          { label: "Total Appointments", value: data?.stats?.totalAppointments, icon: "📅", color: "#fef3c7" },
          { label: "Pending Approvals", value: data?.stats?.pendingDoctors, icon: "⏳", color: "#fee2e2" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div><p className="stat-label">{s.label}</p><p className="stat-value">{s.value ?? 0}</p></div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Recent Appointments</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                {["Patient","Doctor","Date","Type","Status","Fee"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.recentAppointments?.map((a) => (
                <tr key={a._id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px" }}>{a.patient?.name}</td>
                  <td style={{ padding: "12px 16px" }}>Dr. {a.doctor?.user?.name}</td>
                  <td style={{ padding: "12px 16px" }}>{format(new Date(a.appointmentDate), "MMM dd, yyyy")}</td>
                  <td style={{ padding: "12px 16px", textTransform: "capitalize" }}>{a.consultationType}</td>
                  <td style={{ padding: "12px 16px" }}><span className={`badge ${a.status === "completed" ? "badge-success" : a.status === "pending" ? "badge-warning" : "badge-secondary"}`}>{a.status}</span></td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>₹{a.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
