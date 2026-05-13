import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiStar, FiVideo, FiMessageCircle, FiMapPin } from "react-icons/fi";
import api from "../../utils/api.js";
import "./Patient.css";

const specializations = [
  "General Physician","Cardiologist","Dermatologist","Neurologist","Orthopedist",
  "Pediatrician","Psychiatrist","Gynecologist","ENT Specialist","Ophthalmologist",
  "Urologist","Endocrinologist","Gastroenterologist","Pulmonologist",
];

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", specialization: "", rating: "", consultationType: "" });

  useEffect(() => {
    fetchDoctors();
  }, [filters, page]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9, ...filters }).toString();
      const { data } = await api.get(`/doctors?${params}`);
      setDoctors(data.doctors);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  const setFilter = (k) => (e) => {
    setFilters((f) => ({ ...f, [k]: e.target.value }));
    setPage(1);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">Find Doctors</h1>
        <p className="section-subtitle">Search from 500+ verified specialists across all fields</p>
      </div>

      {/* Filters */}
      <div className="doctors-filters">
        <div className="filters-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label"><FiSearch /> Search</label>
            <input className="form-input" placeholder="Search by doctor name..." value={filters.search} onChange={setFilter("search")} />
          </div>
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <select className="form-select" value={filters.specialization} onChange={setFilter("specialization")}>
              <option value="">All Specializations</option>
              {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Min Rating</label>
            <select className="form-select" value={filters.rating} onChange={setFilter("rating")}>
              <option value="">Any Rating</option>
              <option value="4.5">4.5+</option>
              <option value="4">4.0+</option>
              <option value="3">3.0+</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Consultation</label>
            <select className="form-select" value={filters.consultationType} onChange={setFilter("consultationType")}>
              <option value="">Any Type</option>
              <option value="video">Video</option>
              <option value="chat">Chat</option>
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ search: "", specialization: "", rating: "", consultationType: "" }); setPage(1); }}>
            Clear
          </button>
        </div>
      </div>

      {/* Results header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{loading ? "Searching..." : `${total} doctors found`}</p>
      </div>

      {/* Doctor grid */}
      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : doctors.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>🔍</div>
          <h3>No doctors found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="doctors-grid">
          {doctors.map((doc) => <DoctorCard key={doc._id} doctor={doc} />)}
        </div>
      )}

      {/* Pagination */}
      {total > 9 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span style={{ padding: "8px 14px", fontSize: 14, color: "var(--text-muted)" }}>Page {page}</span>
          <button className="btn btn-outline btn-sm" disabled={page * 9 >= total} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

function DoctorCard({ doctor }) {
  const user = doctor.user || {};
  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="doctor-card">
      <div className="doctor-card-top">
        <div className="avatar avatar-lg" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 22 }}>
          {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : initials}
        </div>
        <div className="doctor-card-info">
          <h3>Dr. {user.name}</h3>
          <p className="doctor-card-spec">{doctor.specialization}</p>
          <p className="doctor-card-exp">{doctor.experience} yrs experience</p>
          <div className="doctor-rating">
            <FiStar fill="#f59e0b" color="#f59e0b" size={13} />
            {doctor.rating} <span style={{ color: "var(--text-light)", fontWeight: 400 }}>({doctor.totalReviews})</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {doctor.videoConsultation && <span className="badge badge-primary"><FiVideo size={10} /> Video</span>}
            {doctor.chatConsultation && <span className="badge badge-success"><FiMessageCircle size={10} /> Chat</span>}
            {user.address?.city && <span className="badge badge-secondary"><FiMapPin size={10} /> {user.address.city}</span>}
          </div>
        </div>
      </div>
      <div className="doctor-card-bottom">
        <div>
          <p className="doctor-fee">₹{doctor.consultationFee}</p>
          <p className="doctor-fee-label">per consultation</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to={`/patient/doctors/${doctor._id}`} className="btn btn-outline btn-sm">Profile</Link>
          <Link to={`/patient/book/${doctor._id}`} className="btn btn-primary btn-sm">Book Now</Link>
        </div>
      </div>
    </div>
  );
}
