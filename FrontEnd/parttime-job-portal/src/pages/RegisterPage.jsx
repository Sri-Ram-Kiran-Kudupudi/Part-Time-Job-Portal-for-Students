import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./css/RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "Male",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    city: "",
    district: "",
    state: "",
    skills: "",
    experience: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------------------------
  // VALIDATION
  // ---------------------------
  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Full name, email & password are required.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  // ---------------------------
  // SUBMIT FORM
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    const payload = {
      fullName: formData.fullName,
      age: formData.role === "seeker" ? Number(formData.age) : null,
      gender: formData.role === "seeker" ? formData.gender : null,
      phone: formData.phone || null, // <= ADDED
      email: formData.email,
      password: formData.password,
      role: formData.role.toUpperCase(),

      city: formData.role === "seeker" ? formData.city : null,
      district: formData.role === "seeker" ? formData.district : null,
      state: formData.role === "seeker" ? formData.state : null,
      skills: formData.role === "seeker" ? formData.skills : null,
      experience: formData.role === "seeker" ? formData.experience : null,
    };

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast.error("Email already exists or invalid details.");
        return;
      }

      toast.success("Account created successfully! Please login.");

      setTimeout(() => navigate("/login"), 700);

    } catch (err) {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Your Account</h2>

        <form onSubmit={handleSubmit} className="form-spacing">

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              name="fullName"
              className="form-control-base"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              name="phone"
              className="form-control-base"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Age, Gender only for seeker */}
          {formData.role === "seeker" && (
            <>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  className="form-control-base"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-control-base"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control-base"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control-base"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control-base"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-control-base"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="seeker">Job Seeker</option>
              <option value="provider">Job Provider</option>
            </select>
          </div>

          {/* Extra fields for seeker */}
          {formData.role === "seeker" && (
            <>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  name="city"
                  className="form-control-base"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <input
                  name="district"
                  className="form-control-base"
                  value={formData.district}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  name="state"
                  className="form-control-base"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills</label>
                <input
                  name="skills"
                  className="form-control-base"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience</label>
                <input
                  name="experience"
                  className="form-control-base"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="register-btn-full">
            Register
          </button>
        </form>

        <p className="register-login-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
