// pages/ProviderAgreementPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "./ProviderAgreementPage.css";
import { providerAccept } from "../../service/api";
import { toast } from "react-toastify";

const providerTerms = [
  "You must pay the worker the agreed amount after work is completed.",
  "Treat workers respectfully; do not misuse or overwork them.",
  "Platform is only a connector and does not take responsibility for disputes.",
  "Provide only safe, public, or professional workspace.",
  "Do not ask workers to come to unsafe or suspicious private locations.",
  "You must provide correct job details (timing, address, work type).",
  "If you cancel at the last minute, your provider account may be restricted.",
  "You agree to follow all local labor and safety rules.",
];

const ProviderAgreementPage = () => {
  const { jobId, applicantId, applicationId } = useParams();
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBack = () => navigate(-1);

  const handleAgree = async () => {
    if (!agreed) return;

    setLoading(true);
    try {
      await providerAccept(applicationId);

      toast.success("You have accepted this applicant!");

      setTimeout(() => {
        navigate(`/provider/job/${jobId}`);
      }, 1200);
    } catch (err) {
      toast.error("Failed to accept applicant.");
    }
    setLoading(false);
  };

  return (
    <div className="agreement-page-container">
      <Header title="Provider Agreement" />

      <main className="agreement-main-content">
        <button onClick={handleBack} className="btn-back-link">
          ← Back
        </button>

        <div className="agreement-card">
          <h2 className="agreement-title">Terms & Conditions</h2>

          <p className="agreement-sub-text">
            Please read and accept to continue.
          </p>

          <div className="terms-scroll-area">
            <ul className="terms-list">
              {providerTerms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>

          <div className="agreement-checkbox-wrapper">
            <input
              type="checkbox"
              id="agreementCheck"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="agreement-checkbox"
            />
            <label htmlFor="agreementCheck" className="agreement-label">
              ✔ I agree to all terms.
            </label>
          </div>

          <button
            onClick={handleAgree}
            disabled={!agreed || loading}
            className={`agree-button ${!agreed ? "disabled" : "btn-primary"}`}
          >
            {loading ? "Processing..." : "Accept & Continue"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProviderAgreementPage;
