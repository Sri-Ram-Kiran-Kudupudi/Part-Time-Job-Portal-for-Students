// pages/JobSeeker/ApplyAgreementPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "./ApplyAgreementPage.css";
import { IoArrowBack } from "react-icons/io5";

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

  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await getJobById(jobId);
        const { address, ...jobData } = res.data;

        setJob({
          ...jobData,
          location: address || "Location N/A"
        });

      } catch (err) {
        console.error("Job load error:", err);
      }
      setLoading(false);
    };
    loadJob();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed || isApplying) return;

    setIsApplying(true);

    try {
      await applyJob(jobId, { message: "Applicant agreed to all terms." });

      toast.success("Application submitted successfully!");

      setTimeout(() => navigate("/jobs/applied"), 1200);

    } catch (error) {
      console.error("Application Error:", error);
      const msg = error?.response?.data?.message || "Something went wrong.";

      if (msg.toLowerCase().includes("already"))
        toast.error("You have already applied for this job.");
      else toast.error(msg);

    } finally {
      setIsApplying(false);
    }
  };

  if (loading) return (
    <div className="app-background min-h-screen">
      <main className="agreement-page-container">
        <p>Loading job details...</p>
      </main>
    </div>
  );

  if (!job) return (
    <div className="app-background min-h-screen">
      <main className="agreement-page-container">
        <p>Job not found.</p>
      </main>
    </div>
  );

  return (
    <div className="app-background min-h-screen">

      {/* PRODUCTION FLOATING BACK BUTTON */}
      <button onClick={() => navigate(-1)} className="back-floating-btn">
        <IoArrowBack size={22} color="black" />
      </button>

      <main className="agreement-page-container">

        {/* CENTER CARD */}
        <form onSubmit={handleSubmit} className="agreement-card card shadow-md">

          <h2 className="agreement-title">Application Agreement & Terms</h2>

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
            className={`btn btn-primary apply-btn w-full ${!agreed || isApplying ? "btn-disabled" : ""}`}
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
