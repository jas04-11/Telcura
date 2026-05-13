import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiVideo, FiMessageCircle, FiCheckCircle } from "react-icons/fi";
import api from "../../utils/api.js";
import toast from "react-hot-toast";
import { format, addDays, isBefore, startOfToday } from "date-fns";

const TIME_SLOTS = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM"];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ timeSlot: "", consultationType: "video", symptoms: "" });

  // Generate next 14 days
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  useEffect(() => {
    api.get(`/doctors/${doctorId}`).then(({ data }) => {
      setDoctor(data.doctor);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      api.get(`/doctors/${doctorId}/availability?date=${format(selectedDate, "yyyy-MM-dd")}`)
        .then(({ data }) => setBookedSlots(data.bookedTimes || []))
        .catch(() => {});
    }
  }, [selectedDate, doctorId]);

  const handleBook = async () => {
    if (!selectedDate || !form.timeSlot) return toast.error("Please select a date and time");
    setSubmitting(true);
    try {
      await api.post("/appointments", {
        doctorId,
        appointmentDate: selectedDate.toISOString(),
        timeSlot: form.timeSlot,
        consultationType: form.consultationType,
        symptoms: form.symptoms,
      });
      toast.success("Appointment booked successfully!");
      navigate("/patient/appointments");
    } catch {} finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!doctor) return <div className="empty-state"><h3>Doctor not found</h3></div>;

  const user = doctor.user || {};

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <h1 className="section-title">Book Appointment</h1>
      <p className="section-subtitle">Schedule a consultation with Dr. {user.name}</p>

      {/* Doctor mini-card */}
      <div className="card" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24, padding: "16px 24px" }}>
        <div className="avatar avatar-md" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 18 }}>
          {user.name?.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>Dr. {user.name}</p>
          <p style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>{doctor.specialization}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>₹{doctor.consultationFee}</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>consultation fee</p>
        </div>
      </div>

      {/* Step 1 – Consultation Type */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>1. Consultation Type</h3>
        <div style={{ display: "flex", gap: 14 }}>
          {[
            { value: "video", icon: <FiVideo />, label: "Video Call", desc: "Face-to-face video consultation", available: doctor.videoConsultation },
            { value: "chat", icon: <FiMessageCircle />, label: "Chat", desc: "Text-based consultation", available: doctor.chatConsultation },
          ].map((t) => (
            <div key={t.value} onClick={() => t.available && setForm((f) => ({ ...f, consultationType: t.value }))}
              style={{ flex: 1, padding: "18px 20px", border: `2px solid ${form.consultationType === t.value ? "var(--primary)" : "var(--border)"}`, borderRadius: "var(--radius)", cursor: t.available ? "pointer" : "not-allowed",
                background: form.consultationType === t.value ? "var(--primary-light)" : "#fff", opacity: t.available ? 1 : 0.4, transition: "all 0.2s" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 20, color: form.consultationType === t.value ? "var(--primary)" : "var(--text-muted)" }}>{t.icon}</span>
                <p style={{ fontWeight: 700, color: form.consultationType === t.value ? "var(--primary)" : "var(--text)" }}>{t.label}</p>
                {form.consultationType === t.value && <FiCheckCircle color="var(--primary)" style={{ marginLeft: "auto" }} />}
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2 – Date */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>2. Select Date</h3>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {availableDates.map((date) => {
            const isSelected = selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            return (
              <div key={date.toISOString()} onClick={() => { setSelectedDate(date); setForm((f) => ({ ...f, timeSlot: "" })); }}
                style={{ padding: "12px 16px", borderRadius: "var(--radius-sm)", border: `2px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                  background: isSelected ? "var(--primary)" : "#fff", cursor: "pointer", textAlign: "center",
                  minWidth: 72, transition: "all 0.2s", flexShrink: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: isSelected ? "rgba(255,255,255,0.75)" : "var(--text-muted)", textTransform: "uppercase" }}>
                  {format(date, "EEE")}
                </p>
                <p style={{ fontSize: 18, fontWeight: 800, color: isSelected ? "#fff" : "var(--dark)", margin: "2px 0" }}>
                  {format(date, "dd")}
                </p>
                <p style={{ fontSize: 11, color: isSelected ? "rgba(255,255,255,0.75)" : "var(--text-muted)" }}>
                  {format(date, "MMM")}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3 – Time slot */}
      {selectedDate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>3. Select Time Slot</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {TIME_SLOTS.map((slot) => {
              const booked = bookedSlots.includes(slot);
              const selected = form.timeSlot === slot;
              return (
                <button key={slot} disabled={booked} onClick={() => setForm((f) => ({ ...f, timeSlot: slot }))}
                  style={{ padding: "9px 16px", borderRadius: "var(--radius-sm)", border: `1.5px solid ${selected ? "var(--primary)" : booked ? "transparent" : "var(--border)"}`,
                    background: selected ? "var(--primary)" : booked ? "#f1f5f9" : "#fff",
                    color: selected ? "#fff" : booked ? "var(--text-light)" : "var(--text)",
                    fontSize: 14, fontWeight: 500, cursor: booked ? "not-allowed" : "pointer",
                    textDecoration: booked ? "line-through" : "none", transition: "all 0.15s", fontFamily: "var(--font-body)" }}>
                  <FiClock size={11} style={{ marginRight: 4 }} />
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 4 – Symptoms */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>4. Describe Your Symptoms</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>Help the doctor prepare before your consultation</p>
        <textarea className="form-textarea" rows={4} placeholder="E.g., I've been experiencing chest pain and shortness of breath for 3 days..."
          value={form.symptoms} onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))} />
      </div>

      {/* Summary & Book */}
      {selectedDate && form.timeSlot && (
        <div className="card" style={{ marginBottom: 24, background: "var(--primary-light)", border: "1.5px solid var(--primary)" }}>
          <h3 style={{ marginBottom: 12, color: "var(--primary)" }}>Booking Summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Date", value: format(selectedDate, "MMMM dd, yyyy") },
              { label: "Time", value: form.timeSlot },
              { label: "Type", value: form.consultationType },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontWeight: 700, textTransform: "capitalize" }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Fee</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>₹{doctor.consultationFee}</p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleBook} disabled={submitting}>
              {submitting ? "Booking..." : "Confirm Appointment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
