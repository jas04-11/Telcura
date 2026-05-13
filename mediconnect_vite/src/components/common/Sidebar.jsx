// import React, { useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext.jsx";
// import {
//   FiHome, FiSearch, FiCalendar, FiFileText, FiActivity,
//   FiUser, FiUsers, FiLogOut, FiMenu, FiX, FiHeart,
//   FiAlertCircle, FiShield, FiEdit3, FiDollarSign,
// } from "react-icons/fi";
// import "./Sidebar.css";

// const patientNav = [
//   { to: "/patient/dashboard", icon: <FiHome />, label: "Dashboard" },
//   { to: "/patient/find-doctors", icon: <FiSearch />, label: "Find Doctors" },
//   { to: "/patient/symptom-checker", icon: <FiAlertCircle />, label: "Symptom Checker" },
//   { to: "/patient/appointments", icon: <FiCalendar />, label: "Appointments" },
//   { to: "/patient/prescriptions", icon: <FiFileText />, label: "Prescriptions" },
//   { to: "/patient/health-records", icon: <FiActivity />, label: "Health Records" },
//   { to: "/patient/profile", icon: <FiUser />, label: "Profile" },
// ];

// const doctorNav = [
//   { to: "/doctor/dashboard", icon: <FiHome />, label: "Dashboard" },
//   { to: "/doctor/appointments", icon: <FiCalendar />, label: "Appointments" },
//   { to: "/doctor/profile", icon: <FiEdit3 />, label: "My Profile" },
// ];

// const adminNav = [
//   { to: "/admin/dashboard", icon: <FiHome />, label: "Dashboard" },
//   { to: "/admin/doctors", icon: <FiShield />, label: "Doctors" },
//   { to: "/admin/users", icon: <FiUsers />, label: "Users" },
// ];

// const navByRole = { patient: patientNav, doctor: doctorNav, admin: adminNav };

// export default function Sidebar() {
//   const { user, doctorProfile, logout } = useAuth();
//   const navigate = useNavigate();
//   const [mobileOpen, setMobileOpen] = useState(false);

//   if (!user) return null;
//   const nav = navByRole[user.role] || [];

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

//   return (
//     <>
//       {/* Mobile toggle */}
//       <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
//         {mobileOpen ? <FiX /> : <FiMenu />}
//       </button>

//       {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

//       <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
//         {/* Logo */}
//         <div className="sidebar-logo">
//           <div className="sidebar-logo-icon">
//             <FiHeart size={18} />
//           </div>
//           <span className="sidebar-logo-text">Telcura</span>
//         </div>

//         {/* User info */}
//         <div className="sidebar-user">
//           <div className="avatar avatar-md" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
//             {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials}
//           </div>
//           <div className="sidebar-user-info">
//             <p className="sidebar-user-name">{user.name}</p>
//             <span className="badge badge-primary" style={{ fontSize: "11px", padding: "2px 8px" }}>
//               {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
//             </span>
//             {user.role === "doctor" && doctorProfile && (
//               <p className="sidebar-user-spec">{doctorProfile.specialization}</p>
//             )}
//           </div>
//         </div>

//         <div className="divider" style={{ margin: "0 16px" }} />

//         {/* Navigation */}
//         <nav className="sidebar-nav">
//           <p className="sidebar-nav-label">MAIN MENU</p>
//           {nav.map((item) => (
//             <NavLink
//               key={item.to}
//               to={item.to}
//               className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
//               onClick={() => setMobileOpen(false)}
//             >
//               <span className="sidebar-nav-icon">{item.icon}</span>
//               <span className="sidebar-nav-label-text">{item.label}</span>
//             </NavLink>
//           ))}
//         </nav>

//         <div style={{ flex: 1 }} />

//         {/* Bottom */}
//         <div className="sidebar-bottom">
//           <div className="sidebar-support-card">
//             <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: 4 }}>Need Help?</p>
//             <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Contact our 24/7 support</p>
//             <a href="mailto:support@Telcura.com" className="btn btn-secondary btn-sm" style={{ marginTop: 8, fontSize: "11px" }}>Contact Support</a>
//           </div>
//           <button className="sidebar-logout" onClick={handleLogout}>
//             <FiLogOut size={16} />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiHome, FiSearch, FiCalendar, FiFileText, FiActivity,
  FiUser, FiUsers, FiLogOut, FiMenu, FiX, FiHeart,
  FiAlertCircle, FiShield, FiEdit3,
} from "react-icons/fi";
import NotificationBell from "./NotificationBell.jsx";
import "./Sidebar.css";

const patientNav = [
  { to: "/patient/dashboard", icon: <FiHome />, label: "Dashboard" },
  { to: "/patient/find-doctors", icon: <FiSearch />, label: "Find Doctors" },
  { to: "/patient/symptom-checker", icon: <FiAlertCircle />, label: "Symptom Checker" },
  { to: "/patient/appointments", icon: <FiCalendar />, label: "Appointments" },
  { to: "/patient/prescriptions", icon: <FiFileText />, label: "Prescriptions" },
  { to: "/patient/health-records", icon: <FiActivity />, label: "Health Records" },
  { to: "/patient/profile", icon: <FiUser />, label: "Profile" },
];

const doctorNav = [
  { to: "/doctor/dashboard", icon: <FiHome />, label: "Dashboard" },
  { to: "/doctor/appointments", icon: <FiCalendar />, label: "Appointments" },
  { to: "/doctor/profile", icon: <FiEdit3 />, label: "My Profile" },
];

const adminNav = [
  { to: "/admin/dashboard", icon: <FiHome />, label: "Dashboard" },
  { to: "/admin/doctors", icon: <FiShield />, label: "Doctors" },
  { to: "/admin/users", icon: <FiUsers />, label: "Users" },
];

const navByRole = { patient: patientNav, doctor: doctorNav, admin: adminNav };

export default function Sidebar() {
  const { user, doctorProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;
  const nav = navByRole[user.role] || [];

  const handleLogout = () => { logout(); navigate("/login"); };

  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><FiHeart size={18} /></div>
          <span className="sidebar-logo-text">MediConnect</span>
        </div>

        {/* User info + notification bell */}
        <div className="sidebar-user">
          <div className="avatar avatar-md" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            {user.avatar
              ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : initials}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user.name}</p>
            <span className="badge badge-primary" style={{ fontSize: "11px", padding: "2px 8px" }}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            {user.role === "doctor" && doctorProfile && (
              <p className="sidebar-user-spec">{doctorProfile.specialization}</p>
            )}
          </div>
          {/* Notification Bell */}
          <NotificationBell />
        </div>

        <div className="divider" style={{ margin: "0 16px" }} />

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-nav-label">MAIN MENU</p>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Bottom */}
        <div className="sidebar-bottom">
          <div className="sidebar-support-card">
            <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: 4 }}>Need Help?</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Contact our 24/7 support</p>
            <a href="mailto:support@mediconnect.com" className="btn btn-secondary btn-sm" style={{ marginTop: 8, fontSize: "11px" }}>Contact Support</a>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <FiLogOut size={16} /><span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
