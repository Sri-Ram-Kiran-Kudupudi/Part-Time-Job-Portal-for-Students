import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./JobDetailsPage.css";
import { IoArrowBack } from "react-icons/io5";
import { getJobById } from "../../service/api";

const DetailItem = ({ label, value }) => (
  <div className="detail-item">
    <p className="detail-label">{label}</p>
    <p className="detail-value">{value}</p>
  </div>
);

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await getJobById(jobId);

        const { address, ...jobData } = res.data;
        setJob({
          ...jobData,
          location: address || "No location specified",
        });
      } catch (err) {
        console.error("Job load error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  if (loading)
    return (
      <div className="app-background">
        <main className="job-details-container">
          <p>Loading...</p>
        </main>
      </div>
    );

  if (error || !job)
    return (
      <div className="app-background">
        <main className="job-details-container">
          <p>Unable to load job details.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </main>
      </div>
    );

  return (
    <div className="app-background">
      {/* Fixed Back Button */}
      <button onClick={() => navigate(-1)} className="back-floating-btn">
        <IoArrowBack size={22} color="black" />
      </button>

      <main className="job-details-container">
        <div className="details-card card shadow-md">
          <span className="job-tag">{job.type}</span>
          <h1 className="job-details-title">{job.title}</h1>

          <div className="details-grid">
            <DetailItem label="Timing" value={job.timing} />
            <DetailItem label="Location" value={job.location} />
            <DetailItem label="Salary" value={job.salary} />
          </div>

          <button
            className="btn btn-primary w-full mt-4 apply-now-clickable"
            onClick={() => navigate(`/job/${jobId}/apply`)}
          >
            Apply Now
          </button>
        </div>
      </main>
    </div>
  );
};

export default JobDetailsPage;
