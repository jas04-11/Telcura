// Appointments.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiVideo, FiMessageCircle, FiCalendar, FiClock, FiX } from "react-icons/fi";
import api from "../../utils/api.js";
import { format } from "date-fns";
import toast from "react-hot-toast";
import "./Patient.css";

const STATUS_COLORS = { pending:"badge-warning", confirmed:"badge-primary", completed:"badge-success", cancelled:"badge-danger", "in-progress":"badge-primary" };

export function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => { fetchAppointments(); }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/appointments/patient${statusFilter ? `?status=${statusFilter}` : ""}`);
      setAppointments(data.appointments);
    } catch {} finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`, { data: { reason: "Cancelled by patient" } });
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch {}
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div><h1 className="section-title">My Appointments</h1><p className="section-subtitle">Track all your consultations</p></div>
        <Link to="/patient/find-doctors" className="btn btn-primary">+ Book New</Link>
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["", "pending", "confirmed", "completed", "cancelled"].map((s) => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-outline"}`} onClick={() => setStatusFilter(s)}>
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> :
        appointments.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>📅</div>
            <h3>No appointments found</h3>
            <Link to="/patient/find-doctors" className="btn btn-primary" style={{ marginTop: 12 }}>Find a Doctor</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {appointments.map((a) => (
              <div key={a._id} className="card" style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div className="avatar avatar-md" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 18 }}>
                    {a.doctor?.user?.name?.charAt(0) || "D"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <h3 style={{ fontSize: 16, marginBottom: 4 }}>Dr. {a.doctor?.user?.name || "Unknown"}</h3>
                        <p style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>{a.doctor?.specialization}</p>
                      </div>
                      <span className={`badge ${STATUS_COLORS[a.status] || "badge-secondary"}`}>{a.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap", color: "var(--text-muted)", fontSize: 13 }}>
                      <span><FiCalendar size={12} style={{ marginRight: 4 }} />{format(new Date(a.appointmentDate), "MMM dd, yyyy")}</span>
                      <span><FiClock size={12} style={{ marginRight: 4 }} />{a.timeSlot}</span>
                      <span>{a.consultationType === "video" ? <FiVideo size={12} style={{ marginRight: 4 }} /> : <FiMessageCircle size={12} style={{ marginRight: 4 }} />}{a.consultationType}</span>
                      <span>₹{a.fee}</span>
                    </div>
                    {a.symptoms && <p style={{ marginTop: 10, fontSize: 13, color: "var(--text-muted)", padding: "8px 12px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>💬 {a.symptoms}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {(a.status === "confirmed" || a.status === "in-progress") && (
                      <Link to={`/patient/consultation/${a._id}`} className="btn btn-primary btn-sm">
                        {a.consultationType === "video" ? <FiVideo size={13} /> : <FiMessageCircle size={13} />} Join
                      </Link>
                    )}
                    {a.status === "completed" && a.prescription && (
                      <Link to="/patient/prescriptions" className="btn btn-secondary btn-sm">View Rx</Link>
                    )}
                    {["pending", "confirmed"].includes(a.status) && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a._id)}><FiX size={13} /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default PatientAppointments;
