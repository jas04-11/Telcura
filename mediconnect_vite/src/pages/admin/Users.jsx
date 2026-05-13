import React, { useEffect, useState } from "react";
import api from "../../utils/api.js";
import { format } from "date-fns";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/users").then(({ data }) => setUsers(data.users)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div><h1 className="section-title">All Users</h1><p className="section-subtitle">{users.length} registered users</p></div>
        <input className="form-input" style={{ width: 260 }} placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              {["User","Email","Role","Joined","Status"].map((h) => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar avatar-sm" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 13 }}>
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", color: "var(--text-muted)" }}>{u.email}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span className={`badge ${u.role === "doctor" ? "badge-primary" : u.role === "admin" ? "badge-danger" : "badge-secondary"}`}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: 13 }}>
                  {u.createdAt ? format(new Date(u.createdAt), "MMM dd, yyyy") : "N/A"}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No users found</div>
        )}
      </div>
    </div>
  );
}
