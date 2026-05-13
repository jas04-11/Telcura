import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../utils/api.js";
import toast from "react-hot-toast";

export default function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "", phone: user?.phone || "",
    gender: user?.gender || "", bloodGroup: user?.bloodGroup || "",
    allergies: user?.allergies?.join(", ") || "",
    currentMedications: user?.currentMedications?.join(", ") || "",
    address: { city: user?.address?.city || "", state: user?.address?.state || "", country: user?.address?.country || "" },
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setAddr = (k) => (e) => setForm((f) => ({ ...f, address: { ...f.address, [k]: e.target.value } }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        allergies: form.allergies.split(",").map((s) => s.trim()).filter(Boolean),
        currentMedications: form.currentMedications.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await api.put("/users/profile", payload);
      updateUser(data.user);
      toast.success("Profile updated!");
    } catch {} finally { setLoading(false); }
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700 }}>
      <h1 className="section-title" style={{ marginBottom: 4 }}>My Profile</h1>
      <p className="section-subtitle">Manage your personal and health information</p>

      {/* Avatar */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
        <div className="avatar avatar-xl" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 28 }}>{initials}</div>
        <div>
          <h2>{user?.name}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{user?.email}</p>
          <span className="badge badge-primary" style={{ marginTop: 6 }}>Patient</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Personal Information</h3>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={set("name")} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={set("phone")} /></div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={form.gender} onChange={set("gender")}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select className="form-select" value={form.bloodGroup} onChange={set("bloodGroup")}>
              <option value="">Select</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <h3 style={{ margin: "20px 0 16px" }}>Address</h3>
        <div className="grid-3">
          <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.address.city} onChange={setAddr("city")} /></div>
          <div className="form-group"><label className="form-label">State</label><input className="form-input" value={form.address.state} onChange={setAddr("state")} /></div>
          <div className="form-group"><label className="form-label">Country</label><input className="form-input" value={form.address.country} onChange={setAddr("country")} /></div>
        </div>

        <h3 style={{ margin: "20px 0 16px" }}>Medical Information</h3>
        <div className="form-group">
          <label className="form-label">Allergies (comma separated)</label>
          <input className="form-input" value={form.allergies} onChange={set("allergies")} placeholder="e.g. Penicillin, Dust, Pollen" />
        </div>
        <div className="form-group">
          <label className="form-label">Current Medications (comma separated)</label>
          <input className="form-input" value={form.currentMedications} onChange={set("currentMedications")} placeholder="e.g. Metformin 500mg, Atorvastatin" />
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
