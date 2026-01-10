// src/components/Header.jsx
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ProfileModal from "./ProfileModal";
import "./Header.css";

const getNavLinks = (role = "") => {
  role = role.toLowerCase();

  if (role === "seeker") {
    return [
      { name: "Job Seeker", to: "/jobs/find" },
      { name: "Applied Jobs", to: "/jobs/applied" },
    ];
  }

  if (role === "admin") {
    return [{ name: "Admin Dashboard", to: "/admin/dashboard" }];
  }

  return [];
};

const Header = ({ title = "Part-Time Job Portal" }) => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  const isLoggedIn = user?.isLoggedIn;
  const navLinks = isLoggedIn ? getNavLinks(user.role) : [];

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <Link to={isLoggedIn ? "/dashboard" : "/"} className="header-logo">
            {title}
          </Link>

          <nav className="nav-links">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.to} className="nav-link">
                {link.name}
              </Link>
            ))}
          </nav>

          {isLoggedIn && (
            <div className="profile-container">
              <button
                className="profile-button"
                onClick={() => setShowModal(true)}
              >
                <div className="profile-avatar">
                  {user?.username?.[0] || "U"}
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
