import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "./SeekerAppliedJobsPage.css";
import {
  getAppliedJobs,
  deleteApplication,
  seekerHideApplication,
} from "../../service/api";
import { toast } from "react-toastify";

const AppliedJobCard = ({ job, onDelete, onHide }) => {
  const navigate = useNavigate();

  const normalizedStatus = job.status?.toLowerCase().replace(/\s+/g, "_");
  const isBothAccepted = normalizedStatus === "both_accepted";

  return (
    <div className="applied-job-card">
      <div>
        <h3>{job.title}</h3>
        <p>Provider: {job.providerName}</p>
        <p>📍 {job.location}</p>
        <p>💰 {job.salary}</p>
      </div>

      <div className="status-box">
        <span className={`status-badge ${normalizedStatus}`}>
          {job.status.replace("_", " ")}
        </span>

        {/* ⭐ CHAT BUTTON */}
        {isBothAccepted && job.chatId ? (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/chat/${job.chatId}`)}
          >
            Chat
          </button>
        ) : null}

        {/* ⭐ DELETE BEFORE ACCEPTANCE */}
        {!isBothAccepted && normalizedStatus !== "rejected" && (
          <button className="btn btn-danger" onClick={() => onDelete(job)}>
            Delete
          </button>
        )}

        {/* ⭐ REMOVE AFTER BOTH ACCEPT */}
        {isBothAccepted && (
          <button className="btn btn-danger" onClick={() => onHide(job)}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

const SeekerAppliedJobsPage = () => {
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Hide Modal
  const [showHideModal, setShowHideModal] = useState(false);

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

  const askHide = (job) => {
    setSelectedJob(job);
    setShowHideModal(true);
  };

  const confirmDelete = async () => {
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

  const confirmHide = async () => {
    try {
      await seekerHideApplication(selectedJob.applicationId);
      toast.success("Removed from your list");
      loadJobs();
    } catch (err) {
      toast.error("Failed to remove application");
    }
    setShowHideModal(false);
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
              onHide={askHide}
            />
          ))}
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Withdraw Application</h3>
            <p>
              Remove your application for <b>{selectedJob?.title}</b>?
            </p>

            <div className="modal-buttons">
              <button className="btn btn-danger" onClick={confirmDelete}>
                Yes, Withdraw
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

      {/* HIDE AFTER BOTH ACCEPTED */}
      {showHideModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Remove From List</h3>
            <p>
              Do you want to remove <b>{selectedJob?.title}</b> from your
              completed jobs?
            </p>

            <div className="modal-buttons">
              <button className="btn btn-danger" onClick={confirmHide}>
                Yes, Remove
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowHideModal(false)}
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
