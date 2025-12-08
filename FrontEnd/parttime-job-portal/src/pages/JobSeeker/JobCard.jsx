// components/JobCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./JobCard.css";

const JobCard = ({ job }) => {
  if (!job) return null;

  // Backend fields
  const { id, title, city, district, state, salary, timing, type } = job;

  // Build location string
  const location = city
    ? `${city}${district ? ", " + district : ""}${state ? ", " + state : ""}`
    : "No location";

  const formatSalary = (value) => {
    if (!value) return "Not specified";
    if (!value.includes("₹")) return `₹${value}`;
    return value;
  };

  return (
    <Link to={`/job/${id}`} className="job-card-link">
      <div className="job-card card-shadow">

        {/* Title */}
        <h3 className="job-title">{title || "Untitled Job"}</h3>

        {/* Location */}
        <div className="job-meta-row">
          <span className="job-location">📍 {location}</span>
        </div>

        {/* Salary + Timing */}
        <div className="job-details-row">
          <span className="job-salary">{formatSalary(salary)}</span>
          <span className="job-timing">🕒 {timing || "Timing not specified"}</span>
        </div>

        {/* Job Type (New Position) */}
        <div className="job-type-row">
          <span className="job-type-tag">🏷️ {type}</span>
        </div>

      </div>
    </Link>
  );
};

export default JobCard;
