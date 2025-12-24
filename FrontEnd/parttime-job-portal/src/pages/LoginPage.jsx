// src/pages/LoginPage.jsx
import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./css/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useContext(AuthContext); // ⭐ get user also
  const navigate = useNavigate();

  // ✅ MINIMAL FIX:
  // If user already logged in, don't show login page
  useEffect(() => {
    if (user?.isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        toast.error("Invalid email or password.");
        return;
      }

      const data = await res.json();

      const userData = {
        id: data.id,
        token: data.token,
        username: data.fullName || data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        role: (data.role || "").toString().toLowerCase(),
      };

      // store in context + localStorage
      login(userData);

      toast.success("Login successful!");

      // keep your existing behavior
      setTimeout(() => {
        navigate("/dashboard");
      }, 400);

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login to Part-Time Job Portal</h2>

        <form onSubmit={handleLogin} className="form-spacing">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle-btn1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary login-btn-full">
            Login
          </button>
        </form>

        <div className="register-link-area">
          <p>
            New Register? <Link to="/register">Create an Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
