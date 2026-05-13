// Doctor Dashboard
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiUsers, FiDollarSign, FiStar, FiToggleLeft, FiToggleRight, FiVideo, FiMessageCircle } from "react-icons/fi";
import api from "../../utils/api.js";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/doctors/dashboard").then(({ data }) => setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleOnline = async () => {
    try {
      const res = await api.put("/doctors/toggle-online");
      setData((d) => ({ ...d, doctor: { ...d.doctor, isOnline: res.data.isOnline } }));
      toast.success(res.data.isOnline ? "You are now online" : "You are now offline");
    } catch {}
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const { stats, recentAppointments, doctor } = data || {};

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Doctor Dashboard</h1>
          <p style={{ color: "var(--text-muted)" }}>Welcome back, Dr. {data?.doctor?.user?.name?.split(" ")[0]} 👨‍⚕️</p>
        </div>
        <button onClick={toggleOnline} className={`btn ${doctor?.isOnline ? "btn-primary" : "btn-outline"}`} style={{ gap: 8 }}>
          {doctor?.isOnline ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
          {doctor?.isOnline ? "Online" : "Go Online"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: "Today's Appointments", value: stats?.todayAppointments, icon: "📅", color: "#e0f4fb" },
          { label: "Pending Requests", value: stats?.pendingAppointments, icon: "⏳", color: "#fef3c7" },
          { label: "Total Consultations", value: stats?.totalConsultations, icon: "✅", color: "#d1fae5" },
          { label: "Monthly Earnings", value: `₹${stats?.monthlyEarnings?.toLocaleString()}`, icon: "💰", color: "#f3e8ff" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div><p className="stat-label">{s.label}</p><p className="stat-value">{s.value ?? 0}</p></div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent appointments */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16 }}>Recent Appointments</h3>
            <Link to="/doctor/appointments" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {!recentAppointments?.length ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No appointments yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentAppointments.map((a) => (
                <div key={a._id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                  <div className="avatar avatar-sm" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                    {a.patient?.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{a.patient?.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{format(new Date(a.appointmentDate), "MMM dd")} · {a.timeSlot}</p>
                  </div>
                  <span className={`badge ${a.status === "confirmed" ? "badge-primary" : a.status === "completed" ? "badge-success" : "badge-warning"}`}>{a.status}</span>
                  {a.status === "confirmed" && (
                    <Link to={`/doctor/consultation/${a._id}`} className="btn btn-primary btn-sm">
                      {a.consultationType === "video" ? <FiVideo size={12} /> : <FiMessageCircle size={12} />}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div>
          <div className="card" style={{ marginBottom: 16, background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "#fff" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: 40 }}>⭐</div>
              <div>
                <p style={{ opacity: 0.75, fontSize: 13 }}>Your Rating</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800 }}>{stats?.rating || "N/A"}</p>
                <p style={{ opacity: 0.75, fontSize: 13 }}>{stats?.totalReviews} reviews</p>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link to="/doctor/appointments" className="btn btn-secondary btn-full"><FiCalendar /> View Appointments</Link>
              <Link to="/doctor/profile" className="btn btn-secondary btn-full"><FiUsers /> Update Profile</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
