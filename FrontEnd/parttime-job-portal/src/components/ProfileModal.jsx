// src/components/ProfileModal.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { updateUser, updateApplicant, getApplicantById } from "../service/api";
import { toast } from "react-toastify";
import "./ProfileModal.css";

const ProfileModal = ({ onClose }) => {
  const { user, updateUserState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    age: "",
    gender: "",
    city: "",
    district: "",
    state: "",
    skills: "",
    experience: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function load() {
      try {
        setForm((prev) => ({
          ...prev,
          fullName: user.username,
          phone: user.phone || "",
        }));

        if (user.role?.toLowerCase() === "seeker") {
          const res = await getApplicantById(user.id);
          if (!mounted) return;

          setForm((prev) => ({
            ...prev,
            ...res.data,
            fullName: user.username,
            phone: user.phone,
          }));
        }
      } catch {
        toast.error("Failed to load profile information");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // -----------------------------
  // SAVE PROFILE
  // -----------------------------
  const saveChanges = async () => {
    try {
      await updateUser(user.id, {
        fullName: form.fullName,
        phone: form.phone,
        age: form.age,
        gender: form.gender,
      });

      if (user.role?.toLowerCase() === "seeker") {
        await updateApplicant(user.id, {
          age: form.age,
          gender: form.gender,
          city: form.city,
          district: form.district,
          state: form.state,
          skills: form.skills,
          experience: form.experience,
        });
      }

      updateUserState({
        fullName: form.fullName,
        phone: form.phone,
      });

      toast.success("Profile updated successfully!");
      onClose();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  // -----------------------------
  // LOGOUT (PROFESSIONAL)
  // -----------------------------
  const handleLogout = () => {
    logout();           // clear auth
    onClose();          // close modal
    navigate("/login"); // redirect
  };

  if (loading)
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-loading">Loading...</div>
        </div>
      </div>
    );

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>Edit Profile</h2>

        <div className="form-group">
          <label>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>

        {user.role?.toLowerCase() === "seeker" && (
          <>
            <div className="form-group">
              <label>Age</label>
              <input name="age" value={form.age} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <input name="gender" value={form.gender} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>District</label>
              <input name="district" value={form.district} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>State</label>
              <input name="state" value={form.state} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Skills</label>
              <textarea name="skills" value={form.skills} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Experience</label>
              <textarea name="experience" value={form.experience} onChange={handleChange} />
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>

          {/* ⭐ PROFESSIONAL LOGOUT */}
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>

          <button className="btn-save" onClick={saveChanges}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
