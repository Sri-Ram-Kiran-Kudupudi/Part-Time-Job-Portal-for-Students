// src/pages/DashboardPage.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiFileText,
  FiPlusCircle,
  FiUsers,
  FiFolder,
} from "react-icons/fi";

import Header from "../components/Header.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import "./css/DashboardPage.css";

const normalizeRole = (role) => {
  if (!role) return null;
  const r = role.toUpperCase();

  if (r === "JOB_SEEKER") return "seeker";
  if (r === "EMPLOYER") return "provider";
  if (r === "ADMIN") return "admin";

  return r.toLowerCase();
};

const getRoleInfo = (role) => {
  switch (role) {
    case "seeker":
      return {
        subtitle: "Start exploring part-time jobs near you.",
        quickActions: [
          {
            label: "Search Jobs",
            icon: <FiSearch />,
            to: "/jobs/find",
          },
          {
            label: "Applied Jobs",
            icon: <FiFileText />,
            to: "/jobs/applied",
          },
        ],
      };

    case "provider":
          return {
            subtitle: "Post and manage your job listings.",
            quickActions: [
              {
                label: "Post Job",
                icon: <FiPlusCircle />,
                to: "/provider/dashboard?view=post",
              },
              {
                label: "Uploaded Jobs",
                icon: <FiFolder />,
                to: "/provider/dashboard?view=jobs",
              },
            ],
          };


    case "admin":
      return {
        subtitle: "Manage users, jobs, and system activity.",
        quickActions: [
          {
            label: "Manage Users",
            icon: <FiUsers />,
            to: "/admin/seekers",
          },
          {
            label: "Manage Jobs",
            icon: <FiFolder />,
            to: "/admin/records",
          },
        ],
      };

    default:
      return { subtitle: "Welcome to the portal.", quickActions: [] };
  }
};

const QuickActionButton = ({ label, icon, to }) => (
  <Link to={to} className="quick-button">
    <div className="quick-icon">{icon}</div>
    <div className="quick-label">{label}</div>
  </Link>
);

const DashboardPage = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (!user) return <div className="text-center mt-4">Please login first.</div>;

  const name = user.username || user.fullName || user.email;
  const role = normalizeRole(user.role);
  const roleInfo = getRoleInfo(role);

  return (
    <div className="dashboard-wrapper">
      <Header />

      <div className="dashboard-container">
        <main className="dashboard-content">
          {/* Welcome Card */}
          <div className="welcome-card">
            <h1 className="welcome-title">Welcome, {name}</h1>
            <p className="welcome-sub">{roleInfo.subtitle}</p>
          </div>

          {/* Quick Actions */}
          <h2 className="quick-title">Quick Actions</h2>

          <div className="quick-grid">
            {roleInfo.quickActions.map((item) => (
              <QuickActionButton key={item.label} {...item} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
