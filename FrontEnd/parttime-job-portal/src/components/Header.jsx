// src/components/Header.jsx
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ProfileModal from "./ProfileModal";
import "./Header.css";

const getNavLinks = (role) => {
  switch ((role || "").toLowerCase()) {
    case "seeker":
      return [
        { name: "Job Seeker", to: "/jobs/find" },
        { name: "Applied Jobs", to: "/jobs/applied" },
      ];
    case "provider":
      return [{ name: "Job Provider", to: "/provider/dashboard" }];
    case "admin":
      return [{ name: "Admin Dashboard", to: "/admin/dashboard" }];
    default:
      return [];
  }
};

const Header = ({ title = "Part-Time Job Portal" }) => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  const navLinks = user && user.isLoggedIn ? getNavLinks(user.role) : [];

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <Link to={user.isLoggedIn ? "/dashboard" : "/"} className="header-logo">
            {title}
          </Link>

          <nav className="nav-links">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.to} className="nav-link">
                {link.name}
              </Link>
            ))}
          </nav>

          {user.isLoggedIn && (
            <div className="profile-container">
              <button className="profile-button" onClick={() => setShowModal(true)}>
                <div className="profile-avatar">
                  {user.username ? user.username[0] : "U"}
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {showModal && <ProfileModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Header;
