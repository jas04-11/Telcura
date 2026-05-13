import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import api from "../../utils/api.js";
import toast from "react-hot-toast";

const emptyMed = { name: "", dosage: "", frequency: "", duration: "", instructions: "" };
const emptyTest = { name: "", instructions: "" };
const FREQUENCIES = ["Once daily","Twice daily","Three times daily","Four times daily","Every 4 hours","Every 6 hours","Every 8 hours","At bedtime","As needed","With meals"];

export default function WritePrescription() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ diagnosis: "", medicines: [{ ...emptyMed }], tests: [], advice: "", followUpDate: "" });

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`).then(({ data }) => setAppointment(data.appointment)).catch(() => navigate(-1)).finally(() => setLoading(false));
  }, [appointmentId]);

  const addMedicine = () => setForm((f) => ({ ...f, medicines: [...f.medicines, { ...emptyMed }] }));
  const removeMedicine = (i) => setForm((f) => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
  const updateMed = (i, k, v) => setForm((f) => ({ ...f, medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }));

  const addTest = () => setForm((f) => ({ ...f, tests: [...f.tests, { ...emptyTest }] }));
  const removeTest = (i) => setForm((f) => ({ ...f, tests: f.tests.filter((_, idx) => idx !== i) }));
  const updateTest = (i, k, v) => setForm((f) => ({ ...f, tests: f.tests.map((t, idx) => idx === i ? { ...t, [k]: v } : t) }));

  const handleSubmit = async () => {
    if (!form.diagnosis) return toast.error("Please enter a diagnosis");
    if (!form.medicines[0]?.name) return toast.error("Please add at least one medicine");
    setSubmitting(true);
    try {
      await api.post("/prescriptions", { appointmentId, ...form });
      toast.success("Prescription created successfully!");
      navigate("/doctor/appointments");
    } catch {} finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <h1 className="section-title">Write Prescription</h1>
      {appointment && (
        <div className="card" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24, padding: "16px 24px" }}>
          <div className="avatar avatar-md" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 18 }}>
            {appointment.patient?.name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700 }}>{appointment.patient?.name}</p>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)" }}>
              {appointment.patient?.gender && <span>{appointment.patient.gender}</span>}
              {appointment.patient?.bloodGroup && <span>Blood: {appointment.patient.bloodGroup}</span>}
              {appointment.patient?.allergies?.length > 0 && <span style={{ color: "var(--danger)" }}>⚠️ Allergies: {appointment.patient.allergies.join(", ")}</span>}
            </div>
          </div>
          {appointment.symptoms && (
            <div style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 200, padding: "8px 12px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
              <strong>Reported:</strong> {appointment.symptoms}
            </div>
          )}
        </div>
      )}

      {/* Diagnosis */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Diagnosis *</label>
          <input className="form-input" placeholder="e.g. Viral Upper Respiratory Tract Infection" value={form.diagnosis} onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} />
        </div>
      </div>

      {/* Medicines */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3>💊 Medicines</h3>
          <button className="btn btn-secondary btn-sm" onClick={addMedicine}><FiPlus /> Add Medicine</button>
        </div>
        {form.medicines.map((med, i) => (
          <div key={i} style={{ padding: "16px", background: "var(--bg)", borderRadius: "var(--radius-sm)", marginBottom: 12, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Medicine #{i + 1}</p>
              {form.medicines.length > 1 && <button onClick={() => removeMedicine(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}><FiTrash2 size={15} /></button>}
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Medicine Name *</label><input className="form-input" placeholder="e.g. Paracetamol 500mg" value={med.name} onChange={(e) => updateMed(i, "name", e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Dosage</label><input className="form-input" placeholder="e.g. 1 tablet" value={med.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} /></div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select className="form-select" value={med.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)}>
                  <option value="">Select</option>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Duration</label><input className="form-input" placeholder="e.g. 5 days, 1 week" value={med.duration} onChange={(e) => updateMed(i, "duration", e.target.value)} /></div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Special Instructions</label>
              <input className="form-input" placeholder="e.g. Take after meals, avoid alcohol" value={med.instructions} onChange={(e) => updateMed(i, "instructions", e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      {/* Tests */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3>🔬 Lab Tests (Optional)</h3>
          <button className="btn btn-secondary btn-sm" onClick={addTest}><FiPlus /> Add Test</button>
        </div>
        {form.tests.map((test, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
            <div className="grid-2" style={{ flex: 1, gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}><input className="form-input" placeholder="Test name (e.g. CBC, LFT)" value={test.name} onChange={(e) => updateTest(i, "name", e.target.value)} /></div>
              <div className="form-group" style={{ margin: 0 }}><input className="form-input" placeholder="Instructions (optional)" value={test.instructions} onChange={(e) => updateTest(i, "instructions", e.target.value)} /></div>
            </div>
            <button onClick={() => removeTest(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", paddingTop: 11 }}><FiTrash2 size={15} /></button>
          </div>
        ))}
      </div>

      {/* Advice & Follow-up */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="form-group">
          <label className="form-label">Doctor's Advice</label>
          <textarea className="form-textarea" rows={3} placeholder="Rest for 3 days, drink plenty of fluids, avoid cold beverages..." value={form.advice} onChange={(e) => setForm((f) => ({ ...f, advice: e.target.value }))} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Follow-up Date (Optional)</label>
          <input type="date" className="form-input" value={form.followUpDate} onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))} min={new Date().toISOString().split("T")[0]} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "💾 Save Prescription"}
        </button>
      </div>
    </div>
  );
}
