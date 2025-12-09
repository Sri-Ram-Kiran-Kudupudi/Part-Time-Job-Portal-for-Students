import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "./ProviderJobDetailsPage.css";
import { toast } from "react-toastify";

import {
  getProviderJobById,
  providerReject,
  providerHideApplication,  // ⭐ NEW IMPORT
} from "../../service/api";

const ProviderJobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchJob = async () => {
    setLoading(true);
    try {
      const res = await getProviderJobById(jobId);
      setJobDetails(res.data);
    } catch (err) {
      toast.error("Failed to load job details.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId]);

  const handleGoBack = () => navigate("/provider/dashboard");

  const handleReject = async (applicationId) => {
    try {
      await providerReject(applicationId);
      toast.info("Applicant rejected");
      fetchJob();
    } catch (err) {
      toast.error("Failed to reject applicant");
    }
  };

  // ⭐ NEW: Provider Hide (Soft Remove)
  const handleProviderHide = async (applicationId) => {
    try {
      await providerHideApplication(applicationId);
      toast.success("Applicant removed from list");
      fetchJob();
    } catch (err) {
      toast.error("Failed to remove applicant");
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: "80vh", fontSize: "1.2rem" }}>
        Loading Job Details...
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="flex-center"
        style={{ height: "80vh", color: "red", fontSize: "1.2rem" }}>
        Job not found.
      </div>
    );
  }

  const applicants = jobDetails.applicants || [];

  const filteredApplicants = applicants.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="provider-details-page">
      <Header title="Job Posting Details" />

      <main className="details-main-content">
        <button onClick={handleGoBack} className="btn-back-link">
          ← Back to Dashboard
        </button>

        {/* JOB DETAILS */}
        <div className="details-card">
          <span className="job-tag tag-primary">{jobDetails.type}</span>

          <h1 className="job-title-h1">{jobDetails.title}</h1>

          <div className="job-meta-grid">
            <p><strong>🕒 Timing:</strong> {jobDetails.timing}</p>
            <p><strong>💵 Salary:</strong> {jobDetails.salary}</p>
            <p className="col-span-2">
              <strong>📍 Location:</strong>
              {jobDetails.city}, {jobDetails.district}, {jobDetails.state}
            </p>
          </div>

          <div className="description-section">
            <h2 className="section-subtitle">Description:</h2>
            <p className="text-gray">{jobDetails.description}</p>
          </div>
        </div>

        {/* APPLICANTS */}
        <div className="applicants-card">
          <h2 className="applicants-header">
            Applied List ({filteredApplicants.length})
          </h2>

          <input
            type="text"
            placeholder="Search applicants by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="applicant-search-input"
          />

          <div className="applicants-card-list">
            {filteredApplicants.map((applicant) => (
              <div className="applicant-card-item" key={applicant.applicationId}>

                {/* LEFT SECTION */}
                <div className="applicant-left">
                  <div
                    className="applicant-avatar"
                    onClick={() => navigate(`/applicant/info/${applicant.userId}`)}
                  >
                    {applicant.name.charAt(0)}
                  </div>

                  <div className="applicant-info">
                    <h3 style={{
                      fontSize: "20px",
                      color: "#2563eb",
                      fontWeight: "600"
                    }}>
                      {applicant.name}

                      <span style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        marginLeft: "10px",
                        fontWeight: "400"
                      }}>
                        Age: {applicant.age}
                      </span>
                    </h3>

                    <span className={`status-badge ${applicant.status}`}>
                      {applicant.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="applicant-actions">
                  
                  {/* ⭐ NEW — REMOVE BUTTON for provider */}
                  {applicant.status === "both_accepted" && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleProviderHide(applicant.applicationId)}
                    >
                      Remove
                    </button>
                  )}

                  {applicant.status === "both_accepted" ? (
                    <button
                      onClick={() => navigate(`/chat/${applicant.chatId}`)}
                      className="btn btn-success btn-chat"
                    >
                      💬 Chat
                    </button>
                  ) : applicant.status !== "rejected" ? (
                    <>
                      <button
                        onClick={() =>
                          navigate(
                            `/provider/agreement/${jobDetails.id}/${applicant.userId}/${applicant.applicationId}`
                          )
                        }
                        className="btn btn-primary"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => handleReject(applicant.applicationId)}
                        className="btn btn-danger"
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                </div>

              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderJobDetailsPage;
