import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "./ProviderJobDetailsPage.css";
import { toast } from "react-toastify";
import { IoArrowBack } from "react-icons/io5";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import {
  getProviderJobById,
  providerReject,
  providerHideApplication,
  getUnreadCount,
} from "../../service/api";

const ProviderJobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // unread count per chatId
  const [unreadMap, setUnreadMap] = useState({});
  const stompRef = useRef(null);

  // =======================
  // MODALS
  // =======================
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const askReject = (appId) => {
    setSelectedApplication(appId);
    setShowRejectModal(true);
  };

  const askRemove = (appId) => {
    setSelectedApplication(appId);
    setShowRemoveModal(true);
  };

  // -----------------------------
  // FETCH JOB DETAILS
  // -----------------------------
  const fetchJob = async () => {
    setLoading(true);
    try {
      const res = await getProviderJobById(jobId);
      setJobDetails(res.data);
    } catch {
      toast.error("Failed to load job details.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId]);

  // -----------------------------
  // INITIAL UNREAD COUNTS
  // -----------------------------
  useEffect(() => {
    if (!jobDetails?.applicants) return;

    jobDetails.applicants.forEach((applicant) => {
      if (!applicant.chatId) return;

      getUnreadCount(applicant.chatId)
        .then((res) => {
          setUnreadMap((prev) => ({
            ...prev,
            [applicant.chatId]: res.data,
          }));
        })
        .catch(() => {});
    });
  }, [jobDetails]);

  // -----------------------------
  // LIVE CHAT UNREAD COUNTS
  // -----------------------------
  useEffect(() => {
    if (!jobDetails?.applicants?.length) return;

    const token = localStorage.getItem("token");
    const socket = new SockJS("http://localhost:8080/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: () => {},
      onConnect: () => {
        jobDetails.applicants.forEach((applicant) => {
          if (!applicant.chatId) return;

          stompClient.subscribe(`/topic/chat/${applicant.chatId}`, () => {
            getUnreadCount(applicant.chatId)
              .then((res) => {
                setUnreadMap((prev) => ({
                  ...prev,
                  [applicant.chatId]: res.data,
                }));
              })
              .catch(() => {});
          });
        });
      },
    });

    stompClient.activate();
    stompRef.current = stompClient;

    return () => stompRef.current?.deactivate();
  }, [jobDetails]);

  // -----------------------------
  // ACTIONS
  // -----------------------------
  const handleGoBack = () => navigate("/provider/dashboard?view=jobs");

  const handleReject = async () => {
    try {
      await providerReject(selectedApplication);
      toast.info("Applicant rejected");
      fetchJob();
    } catch {
      toast.error("Failed to reject applicant");
    }
    setShowRejectModal(false);
    setSelectedApplication(null);
  };

  const handleProviderHide = async () => {
    try {
      await providerHideApplication(selectedApplication);
      toast.success("Applicant removed from list");
      fetchJob();
    } catch {
      toast.error("Failed to remove applicant");
    }
    setShowRemoveModal(false);
    setSelectedApplication(null);
  };

  // -----------------------------
  // UI CONDITIONS
  // -----------------------------
  if (loading) {
    return (
      <div className="flex-center" style={{ height: "80vh", fontSize: "1.2rem" }}>
        Loading Job Details...
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="flex-center" style={{ height: "80vh", color: "red" }}>
        Job not found.
      </div>
    );
  }

  const applicants = jobDetails.applicants || [];

  const filteredApplicants = applicants.filter((a) =>
    (a.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="provider-details-page">
      <Header title="Job Posting Details" />

      <button onClick={handleGoBack} className="back-icon-btn">
        <IoArrowBack size={26} />
      </button>

      <main className="details-main-content">
        {/* JOB DETAILS */}
        <div className="details-card">
          <span className="job-tag tag-primary">{jobDetails.type}</span>

          <h1 className="job-title-h1">{jobDetails.title}</h1>

          <div className="job-meta-grid">
            <p><strong>Timing:</strong> {jobDetails.timing}</p>
            <p><strong>Salary:</strong> {jobDetails.salary}</p>
            <p className="col-span-2">
              <strong>Location:</strong> {jobDetails.address || "Not Provided"}
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
                <div className="applicant-left">
                  <div
                    className="applicant-avatar"
                    onClick={() => navigate(`/applicant/info/${applicant.userId}`)}
                  >
                    {applicant.name?.charAt(0)}
                  </div>

                  <div className="applicant-info">
                    <h3>
                      {applicant.name}
                      <span style={{ color: "#6b7280", fontSize: 14, marginLeft: 10 }}>
                        Age: {applicant.age}
                      </span>
                    </h3>

                    <span className={`status-badge ${applicant.status}`}>
                      {applicant.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="applicant-actions">
                  {applicant.status === "both_accepted" && (
                    <>
                      <button
                        className="btn btn-danger remove-btn"
                        onClick={() => askRemove(applicant.applicationId)}
                        style={{ marginBottom: "-8px" }}
                      >
                        Remove
                      </button>

                      <button
                        onClick={() => navigate(`/chat/${applicant.chatId}`)}
                        className="btn btn-primary chat-btn"
                      >
                        💬 Chat
                        {unreadMap[applicant.chatId] > 0 && (
                          <span className="chat-badge">
                            {unreadMap[applicant.chatId]}
                          </span>
                        )}
                      </button>
                    </>
                  )}

                  {applicant.status !== "both_accepted" &&
                    applicant.status !== "rejected" && (
                      <>
                        <button
                          onClick={() => askReject(applicant.applicationId)}
                          className="btn btn-danger"
                          style={{ marginBottom: "-10px" }}
                        >
                          Reject
                        </button>

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
                      </>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ================= REJECT MODAL ================= */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Reject Applicant?</h3>
            <p>This action cannot be undone.</p>

            <div className="modal-buttons">
              <button className="btn btn-danger" onClick={handleReject}>
                Yes, Reject
              </button>

              <button
                className="btn btn-outline-primary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REMOVE MODAL ================= */}
      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Remove From List?</h3>
            <p>You can still access the user later.</p>

            <div className="modal-buttons">
              <button className="btn btn-danger" onClick={handleProviderHide}>
                Yes, Remove
              </button>

              <button
                className="btn btn-outline-primary"
                onClick={() => setShowRemoveModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderJobDetailsPage;
