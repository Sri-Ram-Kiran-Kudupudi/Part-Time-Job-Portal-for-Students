import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "./SeekerAppliedJobsPage.css";
import { getAppliedJobs, deleteApplication } from "../../service/api";
import { toast } from "react-toastify";

const AppliedJobCard = ({ job, onDelete }) => {
  const navigate = useNavigate();

  const getStatusInfo = (status) => {
    const s = status?.toLowerCase().replace(/\s+/g, "_");

    if (s === "both_accepted")
      return { text: "Accepted", className: "status-accepted", canDelete: false };

    if (s === "seeker_accepted" || s === "provider_accepted")
      return { text: "Waiting for Provider", className: "status-waiting", canDelete: true };

    if (s === "rejected")
      return { text: "Rejected", className: "status-rejected", canDelete: false };

    return { text: "Pending", className: "status-pending", canDelete: true };
  };

  const info = getStatusInfo(job.status);

  const normalizedStatus = job.status?.toLowerCase().replace(/\s+/g, "_");
  const showChatButton = normalizedStatus === "both_accepted" && job.chatId != null;

  return (
    <div className="applied-job-card">
      <div>
        <h3>{job.title}</h3>
        <p>Provider: {job.providerName}</p>
        <p>📍 {job.location}</p>
        <p>💰 {job.salary}</p>
      </div>

      <div className="status-box">
        <span className={`status-badge ${info.className}`}>{info.text}</span>

        {showChatButton ? (
          <button
            onClick={() => navigate(`/chat/${job.chatId}`)}
            className="btn btn-primary"
          >
            Chat
          </button>
        ) : (
          info.canDelete && (
            <button className="btn btn-danger" onClick={() => onDelete(job)}>
              Delete
            </button>
          )
        )}
      </div>
    </div>
  );
};

const SeekerAppliedJobsPage = () => {
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await getAppliedJobs();
      setAppliedJobs(res.data);
    } catch (err) {
      toast.error("Failed to fetch applied jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const askDelete = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedJob) return;

    try {
      await deleteApplication(selectedJob.applicationId);
      toast.success("Application withdrawn");
      loadJobs();
    } catch (err) {
      toast.error("Could not delete application");
    }

    setShowModal(false);
    setSelectedJob(null);
  };

  return (
    <div className="applied-jobs-page">
      <Header title="Your Applied Jobs" />

      <button className="btn-back-link" onClick={() => navigate("/jobs/find")}>
        ← Back to Find Jobs
      </button>

      <h2>Applied Jobs</h2>

      {loading ? (
        <p className="no-jobs-message">Loading...</p>
      ) : appliedJobs.length === 0 ? (
        <p className="no-jobs-message">No applied jobs yet.</p>
      ) : (
        <div className="applied-jobs-list">
          {appliedJobs.map((job) => (
            <AppliedJobCard
              key={job.applicationId}
              job={job}
              onDelete={askDelete}
            />
          ))}
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to withdraw your application for{" "}
              <b>{selectedJob?.title}</b>?
            </p>

            <div className="modal-buttons">
              <button className="btn btn-danger" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
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

export default SeekerAppliedJobsPage;
