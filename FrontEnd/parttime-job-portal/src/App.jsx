// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// AUTH PAGES
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// DASHBOARD
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

// SEEKER PAGES
import SeekerFindJobsPage from "./pages/JobSeeker/SeekerFindJobsPage";
import SeekerAppliedJobsPage from "./pages/JobSeeker/SeekerAppliedJobsPage";
import JobDetailsPage from "./pages/JobSeeker/JobDetailsPage";
import ApplyAgreementPage from "./pages/JobSeeker/ApplyAgreementPage";
import ChatPage from "./pages/JobSeeker/ChatPage";

// PROVIDER PAGES
import ProviderDashboardPage from "./pages/JobProvider/ProviderDashboardPage";
import ProviderJobDetailsPage from "./pages/JobProvider/ProviderJobDetailsPage";
import ProviderAgreementPage from "./pages/JobProvider/ProviderAgreementPage";
import ApplicantInformationPage from "./pages/JobProvider/ApplicantInformationPage";

// ADMIN PAGES
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminSeekerListPage from "./pages/Admin/AdminSeekerListPage";
import AdminProviderListPage from "./pages/Admin/AdminProviderListPage";
import AdminApplicationRecordsPage from "./pages/Admin/AdminApplicationRecordsPage";

import VerifyOtpPage from "./pages/VerifyOtpPage";


import { AuthContext, AuthProvider } from "./context/AuthContext";

// ------------------------
// Protected Route
// ------------------------
// Protected Route (UPDATED)
// ------------------------
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);

  // ⏳ Wait until auth restored
  if (loading) {
    return null;
  }

  if (!user.isLoggedIn || !user.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const role = user.role?.toLowerCase();
    const allowed = allowedRoles.map(r => r.toLowerCase());

    if (!allowed.includes(role)) {
      return <Navigate to="/404" replace />;
    }
  }

  return children;
};


export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-center" />

        <Routes>
          {/* -------------------------
              PUBLIC ROUTES

          -------------------------- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/404" element={<NotFoundPage />} />

          {/* -------------------------
               DEFAULT DASHBOARD
          -------------------------- */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* -------------------------
                ⭐ PROFILE ROUTES
          -------------------------- */}

          {/* View profile (temporarily empty) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <h1 style={{ paddingTop: "6rem", textAlign: "center" }}>
                  Profile page coming soon...
                </h1>
              </ProtectedRoute>
            }
          />

        
          {/* -------------------------
                SEEKER ROUTES
          -------------------------- */}
          <Route
            path="/jobs/find"
            element={
              <ProtectedRoute allowedRoles={["seeker"]}>
                <SeekerFindJobsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs/applied"
            element={
              <ProtectedRoute allowedRoles={["seeker"]}>
                <SeekerAppliedJobsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job/:jobId"
            element={
              <ProtectedRoute allowedRoles={["seeker"]}>
                <JobDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job/:jobId/apply"
            element={
              <ProtectedRoute allowedRoles={["seeker"]}>
                <ApplyAgreementPage />
              </ProtectedRoute>
            }
          />

          {/* -------------------------
                PROVIDER ROUTES
          -------------------------- */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/provider/job/:jobId"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderJobDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/provider/agreement/:jobId/:applicantId/:applicationId"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderAgreementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applicant/info/:applicantId"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ApplicantInformationPage />
              </ProtectedRoute>
            }
          />

          {/* -------------------------
                ADMIN ROUTES
          -------------------------- */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/seekers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSeekerListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/providers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProviderListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/records"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminApplicationRecordsPage />
              </ProtectedRoute>
            }
          />

          {/* -------------------------
                    CHAT
          -------------------------- */}
          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute allowedRoles={["seeker", "provider"]}>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* -------------------------
                  FALLBACK
          -------------------------- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
