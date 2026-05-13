import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";

// Pages
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";

// Patient Pages
import PatientDashboard from "./pages/patient/Dashboard.jsx";
import FindDoctors from "./pages/patient/FindDoctors.jsx";
import DoctorDetail from "./pages/patient/DoctorDetail.jsx";
import BookAppointment from "./pages/patient/BookAppointment.jsx";
import PatientAppointments from "./pages/patient/Appointments.jsx";
import PatientPrescriptions from "./pages/patient/Prescriptions.jsx";
import HealthRecords from "./pages/patient/HealthRecords.jsx";
import SymptomChecker from "./pages/patient/SymptomChecker.jsx";
import ConsultationRoom from "./pages/patient/ConsultationRoom.jsx";
import PatientProfile from "./pages/patient/Profile.jsx";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/Dashboard.jsx";
import DoctorAppointments from "./pages/doctor/Appointments.jsx";
import DoctorProfile from "./pages/doctor/Profile.jsx";
import WritePrescription from "./pages/doctor/WritePrescription.jsx";
import DoctorConsultation from "./pages/doctor/ConsultationRoom.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminDoctors from "./pages/admin/Doctors.jsx";
import AdminUsers from "./pages/admin/Users.jsx";

// Layout
import Sidebar from "./components/common/Sidebar.jsx";

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Dashboard layout with sidebar
const DashboardLayout = ({ children }) => {
  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">{children}</main>
    </div>
  );
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Patient Routes */}
      <Route path="/patient/dashboard" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><PatientDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/find-doctors" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><FindDoctors /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/doctors/:id" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><DoctorDetail /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/book/:doctorId" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><BookAppointment /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><PatientAppointments /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/prescriptions" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><PatientPrescriptions /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/health-records" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><HealthRecords /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/symptom-checker" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><SymptomChecker /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/consultation/:appointmentId" element={<ProtectedRoute roles={["patient"]}><ConsultationRoom /></ProtectedRoute>} />
      <Route path="/patient/profile" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><PatientProfile /></DashboardLayout></ProtectedRoute>} />

      {/* Doctor Routes */}
      <Route path="/doctor/dashboard" element={<ProtectedRoute roles={["doctor"]}><DashboardLayout><DoctorDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute roles={["doctor"]}><DashboardLayout><DoctorAppointments /></DashboardLayout></ProtectedRoute>} />
      <Route path="/doctor/profile" element={<ProtectedRoute roles={["doctor"]}><DashboardLayout><DoctorProfile /></DashboardLayout></ProtectedRoute>} />
      <Route path="/doctor/prescription/:appointmentId" element={<ProtectedRoute roles={["doctor"]}><DashboardLayout><WritePrescription /></DashboardLayout></ProtectedRoute>} />
      <Route path="/doctor/consultation/:appointmentId" element={<ProtectedRoute roles={["doctor"]}><DoctorConsultation /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><AdminDoctors /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><AdminUsers /></DashboardLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                borderRadius: "10px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
