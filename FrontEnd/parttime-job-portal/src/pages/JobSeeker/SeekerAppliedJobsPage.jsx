// pages/SeekerAppliedJobsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "./SeekerAppliedJobsPage.css";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import {
  getAppliedJobs,
  deleteApplication,
  seekerHideApplication,
  getUnreadCount,
} from "../../service/api";

import { toast } from "react-toastify";

/* ===============================
   APPLIED JOB CARD
================================ */
const AppliedJobCard = ({ job, onDelete, onHide }) => {
  const navigate = useNavigate();
  const stompRef = useRef(null);

  const normalizedStatus = job.status?.toLowerCase().replace(/\s+/g, "_");
  const isBothAccepted = normalizedStatus === "both_accepted";
  const isRejected = normalizedStatus === "rejected";
  const canRemove = isBothAccepted || isRejected;

  const [unreadCount, setUnreadCount] = useState(0);

  // Initial unread count
  useEffect(() => {
    if (!job.chatId || !isBothAccepted) return;

    getUnreadCount(job.chatId)
      .then((res) => setUnreadCount(res.data))
      .catch(() => {});
  }, [job.chatId, isBothAccepted]);

  // Realtime unread update
  useEffect(() => {
    if (!job.chatId || !isBothAccepted) return;

    const token = localStorage.getItem("token");
    const socket = new SockJS("http://localhost:8080/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        stompClient.subscribe(`/topic/chat/${job.chatId}`, () => {
          getUnreadCount(job.chatId)
            .then((res) => setUnreadCount(res.data))
            .catch(() => {});
        });
      },
      debug: () => {},
    });

    stompClient.activate();
    stompRef.current = stompClient;

    return () => stompRef.current?.deactivate();
  }, [job.chatId, isBothAccepted]);

  return (
    <div className="applied-job-card">
      <div>
        <h3 style={{color:"#1e40af"}}>{job.title}</h3>
        <p><strong>Provider:</strong> {job.providerName}</p>
        <p><strong>location:</strong>  {job.location}</p>
        <p><strong>salary:</strong>  {job.salary}</p>
      </div>

      <div className="status-box">
        <div className="action-row">
          {isBothAccepted && job.chatId && (
            <button
              className="btn btn-primary chat-btn"
              onClick={() => navigate(`/chat/${job.chatId}`)}
            >
              💬 Chat
              {unreadCount > 0 && (
                <span className="chat-badge">{unreadCount}</span>
              )}
            </button>

          )}

          {!canRemove && (
            <button
              className="btn btn-danger"
              onClick={() => onDelete(job)}
            >
              Delete
            </button>
          )}

          {canRemove && (
            <button
              className="btn btn-danger"
              onClick={() => onHide(job)}
            >
              Remove
            </button>
          )}
        </div>

        <span className={`status-badge ${normalizedStatus}`}>
          {job.status.replace("_", " ")}
        </span>
      </div>
    </div>
  );
};

/* ===============================
   SEEKER APPLIED JOBS PAGE
================================ */
const SeekerAppliedJobsPage = () => {
  const navigate = useNavigate();

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await getAppliedJobs();
      setAppliedJobs(res.data);
    } catch {
      toast.error("Failed to fetch applied jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  /* ---------- ASK CONFIRMATION ---------- */
  const askDelete = (job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };

  const askHide = (job) => {
    setSelectedJob(job);
    setShowHideModal(true);
  };

  /* ---------- CONFIRM ACTIONS ---------- */
  const confirmDelete = async () => {
    try {
      await deleteApplication(selectedJob.applicationId);
      toast.success("Application withdrawn");
      loadJobs();
    } catch {
      toast.error("Could not delete application");
    }
    setShowDeleteModal(false);
    setSelectedJob(null);
  };

  const confirmHide = async () => {
    try {
      await seekerHideApplication(selectedJob.applicationId);
      toast.success("Removed from your list");
      loadJobs();
    } catch {
      toast.error("Failed to remove application");
    }
    setShowHideModal(false);
    setSelectedJob(null);
  };

  return (
    <div className="applied-jobs-page">
      <Header title="Your Applied Jobs" />

      <button
        className="btn-back-link"
        onClick={() => navigate("/jobs/find")}
      >
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

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Withdraw Application?</h3>
            <p>This action cannot be undone.</p>

            <div className="modal-buttons">
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REMOVE MODAL ================= */}
      {showHideModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Remove From List?</h3>
            <p>You can still access it later if needed.</p>

            <div className="modal-buttons">
              <button
                className="btn btn-danger"
                onClick={confirmHide}
              >
                Yes, Remove
              </button>
              <button
                className="btn btn-outline-primary"
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