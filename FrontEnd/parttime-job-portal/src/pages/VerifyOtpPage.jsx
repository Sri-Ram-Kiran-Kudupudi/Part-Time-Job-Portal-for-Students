import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./css/VerifyOtpPage.css";

const OTP_EXPIRY_SECONDS = 120; // 2 minutes

const VerifyOtpPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⏱ Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // ⏱ Format mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8080/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        toast.error("Invalid or expired OTP");
        return;
      }

      toast.success("Email verified successfully");
      navigate("/login");

    } catch {
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Resend OTP
  const resendOtp = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        toast.error("Failed to resend OTP");
        return;
      }

      toast.success("OTP resent to your email");
      setTimeLeft(OTP_EXPIRY_SECONDS);
      setCanResend(false);
      setOtp("");

    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2 className="verify-title">Verify OTP</h2>

        <p className="verify-email">{email}</p>

        <input
          type="text"
          className="verify-input"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
        />

        <button
          className="verify-btn"
          onClick={verifyOtp}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        {/* ⏱ Countdown */}
        {!canResend && (
          <p className="verify-timer">
            Resend OTP in <span>{formatTime(timeLeft)}</span>
          </p>
        )}

        {/* 🔴 Resend button */}
        <button
          className={`resend-btn ${canResend ? "active" : ""}`}
          onClick={resendOtp}
          disabled={!canResend}
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
