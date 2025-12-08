// pages/JobSeeker/ApplyAgreementPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "./ApplyAgreementPage.css";

import { getJobById, applyJob } from "../../service/api";
import { toast } from "react-toastify";

const termsContent = [
  "I confirm that all information provided in my application is true and accurate.",
  "I agree to the working hours and compensation as stated in the job details.",
  "I understand that any breach of the provider's terms may result in termination.",
  "I authorize the job provider to verify my background and qualifications.",
  "I agree to complete the full term of the assignment unless mutually agreed.",
  "I acknowledge that this is a contractual agreement only.",
  "I agree to maintain confidentiality regarding the provider's business operations."
];

const ApplyAgreementPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Load job details
  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await getJobById(jobId);

        const { city, district, state, ...jobData } = res.data;

        const fullLocation = city
          ? `${city}${district ? ", " + district : ""}${state ? ", " + state : ""}`
          : "Location N/A";

        setJob({ ...jobData, location: fullLocation });
      } catch (err) {
        console.error("Job load error:", err);
      }
      setLoading(false);
    };
    loadJob();
  }, [jobId]);

  // Submit application
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed || isApplying) return;

    setIsApplying(true);

    try {
      // ⭐ FINAL FIX: Required field for backend
      const payload = {
        message: "Applicant has agreed to all terms."
      };

      await applyJob(jobId, payload);

      toast.success("Application submitted successfully!");

      setTimeout(() => {
        navigate("/jobs/applied");
      }, 1200);

    } catch (error) {
      console.error("Application Error:", error);

      let backendMessage = "Something went wrong.";

      if (error.response?.data?.message) {
        backendMessage = error.response.data.message;
      }

      const msg = backendMessage.toLowerCase();

      if (
        msg.includes("already applied") ||
        msg.includes("duplicate") ||
        error.response?.status === 409
      ) {
        toast.error("You have already applied for this job.");
      } else {
        toast.error(backendMessage);
      }

    } finally {
      setIsApplying(false);
    }
  };

  if (loading)
    return (
      <div className="app-background min-h-screen">
        <main className="agreement-page-container">
          <p>Loading job details...</p>
        </main>
      </div>
    );

  if (!job)
    return (
      <div className="app-background min-h-screen">
        <main className="agreement-page-container">
          <p>Job not found.</p>
        </main>
      </div>
    );

  const formatSalary = (value) =>
    !value ? "Not specified" : value.includes("₹") ? value : `₹${value}`;

  return (
    <div className="app-background min-h-screen">
      <main className="agreement-page-container">
        <button onClick={() => navigate(-1)} className="btn-back-link">
          ← Back to Job Details
        </button>

        <div className="summary-card">
          <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>

          <div className="flex-summary-details">
            <span>Location: {job.location}</span>
            <span>Pay: {formatSalary(job.salary)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="terms-card shadow-md">
          <h2>Application Agreement & Terms</h2>

          <div className="terms-scroll-area">
            <ul className="terms-list">
              {termsContent.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>

          <div className="agreement-checkbox-wrapper">
            <input
              type="checkbox"
              id="agreement"
              className="agreement-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="agreement" className="agreement-label">
              I have read and agree to the terms.
            </label>
          </div>

          <button
            type="submit"
            className={`btn btn-primary apply-btn w-full ${
              !agreed || isApplying ? "btn-disabled" : ""
            }`}
            disabled={!agreed || isApplying}
          >
            {isApplying ? "Submitting..." : "Agree & Apply"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ApplyAgreementPage;
