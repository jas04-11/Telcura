import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiVideo, FiMessageCircle, FiCalendar, FiClock, FiEdit3, FiCheckCircle } from "react-icons/fi";
import api from "../../utils/api.js";
import { format } from "date-fns";
import toast from "react-hot-toast";

const STATUS_COLORS = { pending:"badge-warning", confirmed:"badge-primary", completed:"badge-success", cancelled:"badge-danger" };

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => { fetchAppointments(); }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/appointments/doctor${statusFilter ? `?status=${statusFilter}` : ""}`);
      setAppointments(data.appointments);
    } catch {} finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch {}
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">Patient Appointments</h1>
        <p className="section-subtitle">Manage all your consultations</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["", "pending", "confirmed", "completed", "cancelled"].map((s) => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-outline"}`} onClick={() => setStatusFilter(s)}>
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> :
        appointments.length === 0 ? (
          <div className="empty-state"><div style={{ fontSize: 48 }}>📅</div><h3>No appointments</h3></div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {appointments.map((a) => (
              <div key={a._id} className="card" style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div className="avatar avatar-md" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 18 }}>
                    {a.patient?.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <h3 style={{ fontSize: 16, marginBottom: 2 }}>{a.patient?.name}</h3>
                        <div style={{ display: "flex", gap: 12, color: "var(--text-muted)", fontSize: 13, flexWrap: "wrap" }}>
                          {a.patient?.gender && <span>{a.patient.gender}</span>}
                          {a.patient?.dateOfBirth && <span>Age: {new Date().getFullYear() - new Date(a.patient.dateOfBirth).getFullYear()}</span>}
                          {a.patient?.bloodGroup && <span>Blood: {a.patient.bloodGroup}</span>}
                        </div>
                      </div>
                      <span className={`badge ${STATUS_COLORS[a.status] || "badge-secondary"}`}>{a.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap", color: "var(--text-muted)", fontSize: 13 }}>
                      <span><FiCalendar size={12} style={{ marginRight: 4 }} />{format(new Date(a.appointmentDate), "MMM dd, yyyy")}</span>
                      <span><FiClock size={12} style={{ marginRight: 4 }} />{a.timeSlot}</span>
                      <span>{a.consultationType === "video" ? <FiVideo size={12} style={{ marginRight: 4 }} /> : <FiMessageCircle size={12} style={{ marginRight: 4 }} />}{a.consultationType}</span>
                      <span>₹{a.fee}</span>
                    </div>
                    {a.symptoms && (
                      <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--bg)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-muted)" }}>
                        <strong>Symptoms:</strong> {a.symptoms}
                      </div>
                    )}
                    {/* Allergies & History */}
                    {a.patient?.allergies?.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>⚠️ Allergies:</span>
                        {a.patient.allergies.map((al) => <span key={al} className="badge badge-danger" style={{ fontSize: 11 }}>{al}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexDirection: "column", flexShrink: 0 }}>
                    {a.status === "pending" && (
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a._id, "confirmed")}>
                        <FiCheckCircle size={13} /> Confirm
                      </button>
                    )}
                    {a.status === "confirmed" && (
                      <>
                        <Link to={`/doctor/consultation/${a._id}`} className="btn btn-primary btn-sm">
                          {a.consultationType === "video" ? <FiVideo size={13} /> : <FiMessageCircle size={13} />} Start
                        </Link>
                        <Link to={`/doctor/prescription/${a._id}`} className="btn btn-secondary btn-sm">
                          <FiEdit3 size={13} /> Write Rx
                        </Link>
                      </>
                    )}
                    {a.status === "completed" && !a.prescription && (
                      <Link to={`/doctor/prescription/${a._id}`} className="btn btn-outline btn-sm">
                        <FiEdit3 size={13} /> Add Rx
                      </Link>
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
