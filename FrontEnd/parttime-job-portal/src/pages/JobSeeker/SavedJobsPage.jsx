// pages/JobSeeker/SavedJobsPage.jsx
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import JobCard from "./JobCard";
import "./SavedJobsPage.css";

// API import
import { saveJob, unsaveJob, getSavedJobs } from "../../service/api";

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved jobs from backend
  const loadSavedJobs = async () => {
    try {
      const res = await getSavedJobs(); // GET /api/jobs/saved
      setSavedJobs(res.data || []);
    } catch (error) {
      console.error("Failed to load saved jobs:", error);
      alert("Failed to load saved jobs.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await unsaveJob(jobId); // DELETE /api/jobs/:id/save

      // Remove from UI list
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));

      alert("Job removed from saved list.");
    } catch (error) {
      console.error("Unsave failed:", error);
      alert("Failed to unsave job.");
    }
  };

  return (
    <div className="bg-light-gray min-h-screen">
      <Header title="Saved Jobs" />

      <main className="saved-jobs-container">
        <h1 className="saved-jobs-title border-b text-gray-900">Your Saved Jobs</h1>

        {loading ? (
          <p className="text-gray-600 text-center py-5">Loading saved jobs...</p>
        ) : savedJobs.length > 0 ? (
          <div className="saved-jobs-grid">
            {savedJobs.map((job) => (
              <div key={job.id} className="saved-job-card-wrapper">
                <JobCard job={job} />

                <button
                  className="unsave-button"
                  onClick={() => handleUnsave(job.id)}
                >
                  ❌ Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 py-5">
            You haven’t saved any jobs yet.
          </p>
        )}
      </main>
    </div>
  );
};

export default SavedJobsPage;
