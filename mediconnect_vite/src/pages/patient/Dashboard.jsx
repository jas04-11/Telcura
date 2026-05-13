import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiFileText, FiActivity, FiSearch, FiAlertCircle, FiClock, FiVideo, FiMessageCircle, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../utils/api.js";
import { format } from "date-fns";
import "./Patient.css";

const statusColors = {
  pending: "badge-warning", confirmed: "badge-primary",
  completed: "badge-success", cancelled: "badge-danger",
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, prescriptions: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, recRes] = await Promise.all([
        api.get("/appointments/patient?limit=5"),
        api.get("/ai/recommendations"),
      ]);
      const appts = apptRes.data.appointments;
      setAppointments(appts);
      setRecommendations(recRes.data.recommendations?.slice(0, 3) || []);
      setStats({
        upcoming: appts.filter((a) => ["pending", "confirmed"].includes(a.status)).length,
        completed: appts.filter((a) => a.status === "completed").length,
        prescriptions: appts.filter((a) => a.prescription).length,
      });
    } catch {} finally { setLoading(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="patient-dashboard animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">{greeting()}, {user?.name?.split(" ")[0]} 👋</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>How are you feeling today? Let's take care of your health.</p>
        </div>
        <Link to="/patient/symptom-checker" className="btn btn-primary">
          <FiAlertCircle /> AI Symptom Check
        </Link>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        {[
          { to: "/patient/find-doctors", icon: <FiSearch size={22} />, label: "Find Doctors", color: "#e0f4fb", iconColor: "var(--primary)" },
          { to: "/patient/appointments", icon: <FiCalendar size={22} />, label: "Appointments", color: "#d1fae5", iconColor: "#059669" },
          { to: "/patient/prescriptions", icon: <FiFileText size={22} />, label: "Prescriptions", color: "#fef3c7", iconColor: "#d97706" },
          { to: "/patient/health-records", icon: <FiActivity size={22} />, label: "Health Records", color: "#fee2e2", iconColor: "#dc2626" },
        ].map((a) => (
          <Link key={a.to} to={a.to} className="quick-action-card">
            <div className="quick-action-icon" style={{ background: a.color, color: a.iconColor }}>{a.icon}</div>
            <span>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e0f4fb" }}>📅</div>
          <div><p className="stat-label">Upcoming</p><p className="stat-value">{stats.upcoming}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#d1fae5" }}>✅</div>
          <div><p className="stat-label">Completed</p><p className="stat-value">{stats.completed}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7" }}>💊</div>
          <div><p className="stat-label">Prescriptions</p><p className="stat-value">{stats.prescriptions}</p></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent Appointments */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16 }}>Recent Appointments</h3>
            <Link to="/patient/appointments" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {appointments.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 0" }}>
              <p>No appointments yet</p>
              <Link to="/patient/find-doctors" className="btn btn-primary btn-sm" style={{ marginTop: 10 }}>Book Now</Link>
            </div>
          ) : (
            <div className="appt-list">
              {appointments.map((a) => (
                <div key={a._id} className="appt-item">
                  <div className="avatar avatar-sm" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                    {a.doctor?.user?.name?.charAt(0) || "D"}
                  </div>
                  <div className="appt-info">
                    <p className="appt-doctor">Dr. {a.doctor?.user?.name || "Unknown"}</p>
                    <p className="appt-meta">
                      <FiClock size={11} /> {format(new Date(a.appointmentDate), "MMM dd, yyyy")} · {a.timeSlot}
                    </p>
                    <p className="appt-meta">
                      {a.consultationType === "video" ? <FiVideo size={11} /> : <FiMessageCircle size={11} />} {a.consultationType}
                    </p>
                  </div>
                  <span className={`badge ${statusColors[a.status] || "badge-secondary"}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Doctor Recommendations */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16 }}>Recommended Doctors</h3>
            <Link to="/patient/find-doctors" className="btn btn-secondary btn-sm">See More</Link>
          </div>
          {recommendations.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 0" }}>
              <p>Use symptom checker to get personalized recommendations</p>
            </div>
          ) : (
            <div className="appt-list">
              {recommendations.map((doc) => (
                <div key={doc._id} className="appt-item">
                  <div className="avatar avatar-sm" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                    {doc.user?.name?.charAt(0)}
                  </div>
                  <div className="appt-info">
                    <p className="appt-doctor">Dr. {doc.user?.name}</p>
                    <p className="appt-meta">{doc.specialization} · {doc.experience} yrs exp</p>
                    <p className="appt-meta" style={{ color: "#f59e0b" }}>{"★".repeat(Math.round(doc.rating))} {doc.rating}</p>
                  </div>
                  <Link to={`/patient/doctors/${doc._id}`} className="btn btn-secondary btn-sm">
                    <FiArrowRight />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Health tip */}
      <div className="health-tip-banner" style={{ marginTop: 24 }}>
        <div className="health-tip-icon">💡</div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>Daily Health Tip</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Drinking 8 glasses of water daily can improve your energy levels, skin health, and kidney function significantly.</p>
        </div>
        <Link to="/patient/symptom-checker" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Check Symptoms</Link>
      </div>
    </div>
  );
}
