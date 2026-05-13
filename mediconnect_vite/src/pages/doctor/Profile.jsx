// Doctor Profile
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../utils/api.js";
import toast from "react-hot-toast";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const SPECIALIZATIONS = ["General Physician","Cardiologist","Dermatologist","Neurologist","Orthopedist","Pediatrician","Psychiatrist","Gynecologist","ENT Specialist","Ophthalmologist","Urologist","Endocrinologist","Gastroenterologist","Pulmonologist"];

export default function DoctorProfile() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ specialization: "", experience: 0, consultationFee: 0, followUpFee: 0, about: "", languages: "", videoConsultation: true, chatConsultation: true, availability: [] });

  useEffect(() => {
    api.get("/doctors/dashboard").then(({ data }) => {
      const d = data.doctor;
      setDoctor(d);
      setForm({
        specialization: d.specialization || "",
        experience: d.experience || 0,
        consultationFee: d.consultationFee || 0,
        followUpFee: d.followUpFee || 0,
        about: d.about || "",
        languages: d.languages?.join(", ") || "",
        videoConsultation: d.videoConsultation ?? true,
        chatConsultation: d.chatConsultation ?? true,
        availability: d.availability?.length ? d.availability : DAYS.map((day) => ({ day, startTime: "09:00", endTime: "17:00", isAvailable: day !== "Sunday" })),
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateSlot = (i, k, v) => {
    const updated = [...form.availability];
    updated[i] = { ...updated[i], [k]: v };
    setForm((f) => ({ ...f, availability: updated }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean) };
      await api.put("/doctors/profile", payload);
      await api.put("/doctors/availability", { availability: form.availability });
      toast.success("Profile updated successfully!");
    } catch {} finally { setSaving(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <h1 className="section-title" style={{ marginBottom: 4 }}>Doctor Profile</h1>
      <p className="section-subtitle">Keep your profile updated to attract more patients</p>

      {/* Basic Info */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 20 }}>Professional Information</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <select className="form-select" value={form.specialization} onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}>
              {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Experience (years)</label>
            <input type="number" className="form-input" value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: parseInt(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Consultation Fee (₹)</label>
            <input type="number" className="form-input" value={form.consultationFee} onChange={(e) => setForm((f) => ({ ...f, consultationFee: parseInt(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Follow-up Fee (₹)</label>
            <input type="number" className="form-input" value={form.followUpFee} onChange={(e) => setForm((f) => ({ ...f, followUpFee: parseInt(e.target.value) }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Languages Spoken (comma separated)</label>
          <input className="form-input" placeholder="English, Hindi, Punjabi" value={form.languages} onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">About You</label>
          <textarea className="form-textarea" rows={4} placeholder="Describe your expertise, approach to patient care, and experience..." value={form.about} onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))} />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
            <input type="checkbox" checked={form.videoConsultation} onChange={(e) => setForm((f) => ({ ...f, videoConsultation: e.target.checked }))} />
            Video Consultation
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
            <input type="checkbox" checked={form.chatConsultation} onChange={(e) => setForm((f) => ({ ...f, chatConsultation: e.target.checked }))} />
            Chat Consultation
          </label>
        </div>
      </div>

      {/* Availability */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Weekly Availability</h3>
        {form.availability.map((slot, i) => (
          <div key={slot.day} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120, cursor: "pointer" }}>
              <input type="checkbox" checked={slot.isAvailable} onChange={(e) => updateSlot(i, "isAvailable", e.target.checked)} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>{slot.day}</span>
            </label>
            {slot.isAvailable && (
              <>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <input type="time" className="form-input" value={slot.startTime} onChange={(e) => updateSlot(i, "startTime", e.target.value)} style={{ padding: "8px 12px" }} />
                </div>
                <span style={{ color: "var(--text-muted)" }}>to</span>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <input type="time" className="form-input" value={slot.endTime} onChange={(e) => updateSlot(i, "endTime", e.target.value)} style={{ padding: "8px 12px" }} />
                </div>
              </>
            )}
            {!slot.isAvailable && <span style={{ color: "var(--text-light)", fontSize: 13, flex: 1 }}>Not Available</span>}
          </div>
        ))}
      </div>

      <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
