// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    isLoggedIn: false,
    id: null,
    username: null, // full name stored here
    email: null,
    phone: null,
    role: null,
    token: null,
  });

  // Load saved user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("id");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const phone = localStorage.getItem("phone");
    const role = localStorage.getItem("role");

    if (token && id && role) {
      setUser({
        isLoggedIn: true,
        id: Number(id),
        username,
        email,
        phone,
        role,
        token,
      });
    }
  }, []);

  // Login — save in state + localStorage
  const login = (userData) => {
    const finalName = userData.fullName || userData.username || "";

    localStorage.setItem("token", userData.token || "");
    localStorage.setItem("id", String(userData.id || ""));
    localStorage.setItem("username", finalName);
    localStorage.setItem("email", userData.email || "");
    localStorage.setItem("phone", userData.phone || "");
    localStorage.setItem("role", userData.role || "");

    setUser({
      isLoggedIn: true,
      id: userData.id,
      username: finalName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      token: userData.token,
    });
  };

  // ⭐ FIX — Update name instantly after saving profile
  const updateUserState = (updates) => {
    const newData = { ...updates };

    // If fullName updated → update username
    if (updates.fullName) {
      newData.username = updates.fullName;
      localStorage.setItem("username", updates.fullName);
    }

    if (updates.phone) localStorage.setItem("phone", updates.phone);

    setUser((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  // Logout — clear everything
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("phone");
    localStorage.removeItem("role");

    setUser({
      isLoggedIn: false,
      id: null,
      username: null,
      email: null,
      phone: null,
      role: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserState }}>
      {children}
    </AuthContext.Provider>
  );
};
