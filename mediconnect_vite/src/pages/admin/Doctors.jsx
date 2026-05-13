import React, { useEffect, useState } from "react";
import api from "../../utils/api.js";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function AdminDoctors() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/doctors/pending").then(({ data }) => setPending(data.doctors)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const approve = async (id, isApproved) => {
    try {
      await api.put(`/admin/doctors/${id}/approve`, { isApproved });
      setPending((prev) => prev.filter((d) => d._id !== id));
      toast.success(isApproved ? "Doctor approved!" : "Doctor rejected");
    } catch {}
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <h1 className="section-title" style={{ marginBottom: 4 }}>Doctor Approvals</h1>
      <p className="section-subtitle">{pending.length} doctor(s) pending approval</p>

      {pending.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize: 48 }}>✅</div><h3>All caught up! No pending approvals.</h3></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {pending.map((doc) => (
            <div key={doc._id} className="card" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div className="avatar avatar-md" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 18 }}>
                  {doc.user?.name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 2 }}>Dr. {doc.user?.name}</h3>
                  <p style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>{doc.specialization}</p>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: "var(--text-muted)", flexWrap: "wrap" }}>
                    <span>📧 {doc.user?.email}</span>
                    <span>📋 License: {doc.licenseNumber}</span>
                    <span>⏱ {doc.experience} yrs exp</span>
                    <span>💰 ₹{doc.consultationFee}/consult</span>
                    <span>📅 Applied: {doc.user?.createdAt ? format(new Date(doc.user.createdAt), "MMM dd, yyyy") : "N/A"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary" onClick={() => approve(doc._id, true)}>
                    <FiCheckCircle /> Approve
                  </button>
                  <button className="btn btn-danger" onClick={() => approve(doc._id, false)}>
                    <FiXCircle /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
