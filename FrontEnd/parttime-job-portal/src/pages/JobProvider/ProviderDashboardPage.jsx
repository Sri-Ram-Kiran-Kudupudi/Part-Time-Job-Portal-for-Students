import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProviderJobCard from "./ProviderJobCard";
import "./ProviderDashboardPage.css";
import { toast } from "react-toastify";
import LeafletMapPicker from "./components/LeafletMapPicker";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  createJob,
  getProviderJobs,
  deleteProviderJob,
} from "../../service/api";

/* ---------------- CONSTANTS ---------------- */

const jobTypes = [
  "Full Time",
  "Part Time",
  "One-Day Job",
  "Weekend Job",
  "Evening Job",
  "Monthly Job",
  "Urgent / Today Only Job",
];

/* ---------------- REUSABLE INPUTS ---------------- */

const InputField = ({ label, name, type = "text", value, onChange }) => (
  <div className="form-group mb-4">
    <label className="form-label">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required
      className="form-control-base"
    />
  </div>
);

const SelectField = ({ label, name, value, options, onChange }) => (
  <div className="form-group mb-4">
    <label className="form-label">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required
      className="form-control-base"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

/* ---------------- POST JOB FORM ---------------- */

const PostJobForm = ({ onJobSubmit }) => {
  const [jobData, setJobData] = useState({
    name: "",
    type: jobTypes[0],
    timing: "",
    salary: "",
    latitude: null,
    longitude: null,
  });

  const handleChange = (e) =>
    setJobData({ ...jobData, [e.target.name]: e.target.value });

  const handleLocationSelect = (loc) =>
    setJobData((p) => ({
      ...p,
      latitude: loc.lat,
      longitude: loc.lng,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobData.latitude) return toast.error("Select location");

    try {
      const res = await createJob({ title: jobData.name, ...jobData });
      onJobSubmit(res.data);
      toast.success("Job posted");

      // ✅ RESET FORM
      setJobData({
        name: "",
        type: jobTypes[0],
        timing: "",
        salary: "",
        latitude: null,
        longitude: null,
      });
    } catch {
      toast.error("Failed to post job");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField label="Job Name" name="name" value={jobData.name} onChange={handleChange} />
      <SelectField label="Job Type" name="type" value={jobData.type} options={jobTypes} onChange={handleChange} />
      <InputField label="Timing" name="timing" value={jobData.timing} onChange={handleChange} />
      <InputField label="Salary" name="salary" value={jobData.salary} onChange={handleChange} />

      <LeafletMapPicker onLocationSelect={handleLocationSelect} />

      <button className="btn-primary mt-3">Submit</button>
    </form>
  );
};

/* ---------------- MAIN DASHBOARD ---------------- */

const ProviderDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get("view") || "post";

  const [jobs, setJobs] = useState([]);

  const handleBack = () => navigate(-1);

  useEffect(() => {
    getProviderJobs()
      .then((res) => setJobs(res.data))
      .catch(() => toast.error("Failed to load jobs"));
  }, []);

  return (
    <div className="provider-dashboard-page">
      <Header title="Provider Dashboard" />

      <main className="container-md py-5">

        {/* POST JOB VIEW */}
                {view === "post" && (
                <div className="dashboard-card">
                    <button className="btn-back-link" onClick={handleBack}>
                    ← Back
                    </button>

                    <h2>Post New Job</h2>

                    <PostJobForm
                    onJobSubmit={(job) => setJobs((prev) => [job, ...prev])}
                    />
                </div>
                )}

                {/* UPLOADED JOBS VIEW */}
                {view === "jobs" && (
        <div className="dashboard-card">
            <button className="btn-back-link" onClick={handleBack}>
            ← Back
            </button>

            <h2>Your Uploaded Jobs</h2>

            <div className="uploaded-jobs-scroll">
            {jobs.map((job) => (
                <ProviderJobCard
                key={job.id}
                job={job}
                onDelete={async () => {
                    await deleteProviderJob(job.id);
                    setJobs((p) => p.filter((j) => j.id !== job.id));
                }}
                />
            ))}
            </div>
        </div>
        )}


      </main>
    </div>
  );
};

export default ProviderDashboardPage;
