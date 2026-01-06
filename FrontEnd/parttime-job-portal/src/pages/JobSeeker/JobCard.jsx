// components/JobCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./JobCard.css";

const JobCard = ({ job }) => {
  if (!job) return null;


   const { id, title, address, salary, timing, type } = job;

const location = address || "No location";

  const formatSalary = (value) => {
    if (!value) return "Not specified";
    if (!value.includes("₹")) return `₹${value}`;
    return value;
  };

  return (
    <Link to={`/job/${id}`} className="job-card-link">
      <div className="job-card">
        
        <h3 className="job-title">{title || "Untitled Job"}</h3>

        <div className="job-meta-row">
          <span className="job-location">{location || "Location not provided"}</span>
        </div>

        <div className="job-details-row">
          <span className="job-salary">{formatSalary(salary)}</span>
          <span className="job-timing">🕒 {timing || "Not specified"}</span>
        </div>

        <div className="job-type-row">
          <span className="job-type-tag">{type || "General"}</span>
        </div>

      </div>
    </Link>
  );
};

export default JobCard;
