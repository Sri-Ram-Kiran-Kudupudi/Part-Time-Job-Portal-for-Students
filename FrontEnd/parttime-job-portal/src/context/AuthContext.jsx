import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState({
    isLoggedIn: false,
    id: null,
    username: null,
    email: null,
    phone: null,
    role: null,
    token: null,
  });

  // 🔐 Restore auth on refresh WITH EXPIRY CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");

    // ❌ No token → logout
    if (!token || token === "null" || token === "undefined") {
      setLoading(false);
      return;
    }

    try {
      // ✅ Decode JWT
      const decoded = jwtDecode(token);

      // ⏰ Check expiration
      if (decoded.exp * 1000 < Date.now()) {
        toast.info("Session expired. Please login again.");
        localStorage.clear();
        setLoading(false);
        return;
      }

      // ✅ Token valid → restore user
      setUser({
        isLoggedIn: true,
        id: Number(localStorage.getItem("id")),
        username: localStorage.getItem("username"),
        email: localStorage.getItem("email"),
        phone: localStorage.getItem("phone"),
        role: localStorage.getItem("role"),
        token,
      });
    } catch (error) {
      // ❌ Invalid token
      console.error("Invalid token. Logging out...");
      localStorage.clear();
    }

    setLoading(false);
  }, []);

  // 🔑 Login
  const login = (userData) => {
    const finalName = userData.fullName || userData.username || "";

    localStorage.setItem("token", userData.token);
    localStorage.setItem("id", String(userData.id));
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

  // 📝 Update profile info
  const updateUserState = (updates) => {
    const newData = { ...updates };

    if (updates.fullName) {
      newData.username = updates.fullName;
      localStorage.setItem("username", updates.fullName);
    }

    if (updates.phone) {
      localStorage.setItem("phone", updates.phone);
    }

    setUser((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.clear();

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
    <AuthContext.Provider
      value={{ user, login, logout, updateUserState, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
