// pages/JobDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Assuming Header is not needed, or you have a Header component.
// import Header from "../../components/Header"; 
import "./JobDetailsPage.css";

// ✅ Correct API import
import { getJobById, saveJob, unsaveJob } from "../../service/api";

const DetailItem = ({ icon, label, value }) => (
  <div className="detail-item">
    <div className="detail-icon">{icon}</div>
    <div>
      {/* Changed text-sm text-gray-500 to use framework text color */}
      <p className="detail-label">{label}</p>
      <p className="detail-value">{value}</p>
    </div>
  </div>
);

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await getJobById(jobId);

        // ✅ FIX: Construct the location string from city, district, and state
        const { city, district, state, ...jobData } = res.data;
        const fullLocation = city
          ? `${city}${district ? ", " + district : ""}${state ? ", " + state : ""}`
          : "No location specified";

        setJob({ 
          ...jobData, 
          location: fullLocation // Set the combined location
        });
      } catch (err) {
        console.error("Job load error:", err);
      }
      setLoading(false);
    };
    loadJob();
  }, [jobId]);

  const handleApply = () => navigate(`/job/${jobId}/apply`);

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await unsaveJob(jobId);
        setIsSaved(false);
      } else {
        await saveJob(jobId);
        setIsSaved(true);
      }
    } catch {
      alert("Error while saving job.");
    }
  };

  if (loading || !job)
    return (
      <div className="app-background min-h-screen">
        {/* <Header title="Job Details" /> */}
        <main className="job-details-container">
          <p>Loading...</p>
        </main>
      </div>
    );

  return (
    <div className="app-background min-h-screen">
      {/* <Header title="Job Details" /> */}
      <main className="job-details-container">
        <button onClick={() => navigate(-1)} className="btn-back-link">
          &larr; Back
        </button>

        {/* Using 'card' and 'shadow-md' from the new framework */}
        <div className="details-card card shadow-md">
          <span className="job-tag">{job.type}</span>

          <h1 className="job-details-title">{job.title}</h1>

          <div className="description-section">
            <h2 className="section-subtitle">Job Description</h2>
            <p className="description-text">{job.description}</p>
          </div>

          <div className="details-grid">
            <DetailItem icon="🕒" label="Timing" value={job.timing} />
            <DetailItem icon="📍" label="Location" value={job.location} />
            <DetailItem icon="💵" label="Salary" value={job.salary} />
          </div>
          
          {/* ✅ FIX: Apply button is now present and prominent */}
          <button className="btn btn-primary w-full mt-4" onClick={handleApply}>
            Apply Now
          </button>

          {/* Save/Unsave button is secondary/outline style */}
          <button className="btn btn-outline-primary w-full mt-3" onClick={handleSaveToggle}>
            {isSaved ? "Unsave Job" : "Save Job"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default JobDetailsPage;