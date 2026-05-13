import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiStar, FiVideo, FiMessageCircle, FiMapPin, FiAward, FiCalendar, FiUser, FiThumbsUp } from "react-icons/fi";
import api from "../../utils/api.js";
import "./Patient.css";

export default function DoctorDetail() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("about");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, revRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get(`/reviews/doctor/${id}`),
        ]);
        setDoctor(docRes.data.doctor);
        setReviews(revRes.data.reviews);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!doctor) return <div className="empty-state"><h3>Doctor not found</h3></div>;

  const user = doctor.user || {};
  const initials = user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
      {/* Doctor header */}
      <div className="card" style={{ marginBottom: 24, padding: 32 }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div className="avatar avatar-xl" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 30, flexShrink: 0 }}>
            {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 26, marginBottom: 4 }}>Dr. {user.name}</h1>
                <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{doctor.specialization}</p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", color: "var(--text-muted)", fontSize: 14 }}>
                  <span><FiAward size={13} style={{ marginRight: 4 }} />{doctor.experience} Years Experience</span>
                  {user.address?.city && <span><FiMapPin size={13} style={{ marginRight: 4 }} />{user.address.city}</span>}
                  <span><FiUser size={13} style={{ marginRight: 4 }} />{doctor.totalConsultations} Consultations</span>
                </div>
              </div>
              <Link to={`/patient/book/${doctor._id}`} className="btn btn-primary btn-lg">
                <FiCalendar /> Book Appointment
              </Link>
            </div>

            <div style={{ display: "flex", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontSize: 18, fontWeight: 700 }}>
                  <FiStar fill="#f59e0b" /> {doctor.rating}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Rating</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--dark)" }}>{doctor.totalReviews}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Reviews</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>₹{doctor.consultationFee}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Per Consult</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              {doctor.videoConsultation && <span className="badge badge-primary"><FiVideo size={11} /> Video</span>}
              {doctor.chatConsultation && <span className="badge badge-success"><FiMessageCircle size={11} /> Chat</span>}
              {doctor.inClinic && <span className="badge badge-secondary">🏥 In-Clinic</span>}
              {doctor.languages?.map((l) => <span key={l} className="badge badge-secondary">{l}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: "12px", border: "1px solid var(--border)", padding: 4, marginBottom: 20 }}>
        {["about", "qualifications", "availability", "reviews"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, transition: "all 0.2s",
              background: tab === t ? "var(--primary)" : "transparent",
              color: tab === t ? "#fff" : "var(--text-muted)" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card">
        {tab === "about" && (
          <div>
            <h3 style={{ marginBottom: 14 }}>About Dr. {user.name?.split(" ")[0]}</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 20 }}>
              {doctor.about || `Dr. ${user.name} is an experienced ${doctor.specialization} with ${doctor.experience} years of dedicated practice. Committed to providing compassionate, evidence-based care to every patient.`}
            </p>
            {doctor.subSpecialization?.length > 0 && (
              <div>
                <h4 style={{ marginBottom: 10 }}>Sub-specializations</h4>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {doctor.subSpecialization.map((s) => <span key={s} className="badge badge-primary">{s}</span>)}
                </div>
              </div>
            )}
            {doctor.hospital?.name && (
              <div style={{ marginTop: 20, padding: 16, background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>🏥 {doctor.hospital.name}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{doctor.hospital.address}, {doctor.hospital.city}</p>
              </div>
            )}
          </div>
        )}

        {tab === "qualifications" && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Qualifications</h3>
            {doctor.qualifications?.length ? doctor.qualifications.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, padding: "14px 16px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ width: 44, height: 44, background: "var(--primary-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎓</div>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 2 }}>{q.degree}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{q.institution}</p>
                  {q.year && <p style={{ fontSize: 12, color: "var(--text-light)" }}>Year: {q.year}</p>}
                </div>
              </div>
            )) : <p style={{ color: "var(--text-muted)" }}>No qualifications listed yet.</p>}
          </div>
        )}

        {tab === "availability" && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Weekly Availability</h3>
            {doctor.availability?.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {doctor.availability.map((slot) => (
                  <div key={slot.day} style={{ padding: "14px 16px", background: slot.isAvailable ? "var(--primary-light)" : "var(--bg)", borderRadius: "var(--radius-sm)", border: `1px solid ${slot.isAvailable ? "var(--primary)" : "var(--border)"}` }}>
                    <p style={{ fontWeight: 700, color: slot.isAvailable ? "var(--primary)" : "var(--text-muted)", marginBottom: 4 }}>{slot.day}</p>
                    {slot.isAvailable ? <p style={{ fontSize: 13, color: "var(--primary)" }}>{slot.startTime} – {slot.endTime}</p> : <p style={{ fontSize: 13, color: "var(--text-light)" }}>Not Available</p>}
                  </div>
                ))}
              </div>
            ) : <p style={{ color: "var(--text-muted)" }}>Availability not set. Contact to book.</p>}
          </div>
        )}

        {tab === "reviews" && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Patient Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No reviews yet. Be the first to review!</p>
            ) : reviews.map((r) => (
              <div key={r._id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div className="avatar avatar-sm" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                    {r.patient?.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{r.patient?.name}</p>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1,2,3,4,5].map((s) => <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "#e2e8f0", fontSize: 13 }}>★</span>)}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>{r.comment}</p>
                    {r.wouldRecommend && <p style={{ fontSize: 12, color: "var(--accent)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}><FiThumbsUp size={11} /> Would recommend</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
