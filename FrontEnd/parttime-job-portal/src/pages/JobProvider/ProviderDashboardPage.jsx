import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProviderJobCard from "./ProviderJobCard";
import "./ProviderDashboardPage.css";
import { toast } from "react-toastify";
import LeafletMapPicker from "./components/LeafletMapPicker";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

import {
  createJob,
  getProviderJobs,
  deleteProviderJob,
  updateProviderJob,
} from "../../service/api";

const jobTypes = [
  "Full Time",
  "One-Day work",
  "Weekend work",
  "Evening work",
  "Monthly work",
  "Urgent work",
];

/**************** REUSABLE INPUTS ****************/
const InputField = ({ label, name, type = "text", value, onChange, placeholder }) => (
  <div className="form-group mb-4">
    <label className="form-label">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required
      className="form-control-base"
      placeholder={placeholder}
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

/**************** POST JOB FORM ****************/
const PostJobForm = ({ onJobSubmit }) => {
  const [jobData, setJobData] = useState({
    name: "",
    type: jobTypes[0],
    timing: "",
    salary: "",
    address: "",
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
      address: loc.address || "",
    }));

  const timingRegex = /^([1-9]|1[0-2])([:.][0-5][0-9])?\s?(am|pm)\s+to\s+([1-9]|1[0-2])([:.][0-5][0-9])?\s?(am|pm)$/i;
  const salaryRegex = /^[0-9]+\/(day|month|hour)$/i;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobData.latitude) return toast.error("Select location");
    if (!timingRegex.test(jobData.timing)) return toast.error("Invalid timing format");
    if (!salaryRegex.test(jobData.salary)) return toast.error("Invalid salary format");

    try {
      const res = await createJob({
        title: jobData.name,
        type: jobData.type,
        timing: jobData.timing,
        salary: jobData.salary,
        address: jobData.address,
        latitude: jobData.latitude,
        longitude: jobData.longitude,
      });
      toast.success("Job posted successfully!");
      onJobSubmit(res.data);
      setJobData({ name: "", type: jobTypes[0], timing: "", salary: "", address: "", latitude: null, longitude: null });
    } catch {
      toast.error("Failed to post job");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField label="Job Name" name="name" value={jobData.name} onChange={handleChange} />
      <SelectField label="Job Type" name="type" value={jobData.type} options={jobTypes} onChange={handleChange} />
      <InputField label="Timing" name="timing" value={jobData.timing} onChange={handleChange} placeholder="Ex: 9am to 5pm" />
      <InputField label="Salary" name="salary" value={jobData.salary} onChange={handleChange} placeholder="Ex: 1000/day" />
      <LeafletMapPicker onLocationSelect={handleLocationSelect} />
      <button className="btn-primary mt-3">Submit</button>
    </form>
  );
};

/**************** MAIN DASHBOARD ****************/
const ProviderDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get("view") || "post";

  const [jobs, setJobs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [editData, setEditData] = useState({ title: "", type: "", timing: "", salary: "" });

const handleBack = () => {
  navigate("/dashboard");
};

  useEffect(() => {
    getProviderJobs()
      .then((res) => setJobs(res.data))
      .catch(() => toast.error("Failed to load jobs"));
  }, []);

  const confirmDelete = async () => {
    try {
      await deleteProviderJob(selectedJob.id);
      setJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
    setShowDeleteModal(false);
    setSelectedJob(null);
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setEditData({ title: job.title, type: job.type, timing: job.timing, salary: job.salary });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    try {
      await updateProviderJob(selectedJob.id, editData);
      setJobs((prev) => prev.map((job) => job.id === selectedJob.id ? { ...job, ...editData } : job));
      toast.success("Job updated successfully");
      setShowEditModal(false);
    } catch {
      toast.error("Failed to update job");
    }
  };

  return (
    <div className="provider-dashboard-page">
    <Header title="Provider Dashboard" />

    <main className="container-md py-5">
      <button className="back-icon-btn" onClick={handleBack}>
        <IoArrowBack size={22} />
      </button>
      {/* POST JOB VIEW */}
      {view === "post" && (
        <div className="dashboard-card">
          
          <h2>Post New Job</h2>
          <PostJobForm onJobSubmit={(job) => setJobs((prev) => [job, ...prev])} />
        </div>
      )}

      {/* UPLOADED JOBS VIEW */}
      {view === "jobs" && (
        <div className="dashboard-card">

          <h2>Your Uploaded Jobs</h2>
          <div className="uploaded-jobs-scroll">
            {jobs.map((job) => (
              <ProviderJobCard
                key={job.id}
                job={job}
                onEdit={() => openEditModal(job)}
                onDelete={() => {
                  setSelectedJob(job);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </main>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete This Job?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="btn btn-danger" onClick={confirmDelete}>Yes, Delete</button>
              <button className="btn btn-outline-primary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Update Job Details</h3>
            <div className="flex flex-col gap-2">
              <input className="form-control-base mb-2" name="title" value={editData.title} onChange={handleEditChange} />
              <select className="form-control-base mb-2" name="type" value={editData.type} onChange={handleEditChange}>
                {jobTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
              <input className="form-control-base mb-2" name="timing" value={editData.timing} onChange={handleEditChange} />
              <input className="form-control-base mb-2" name="salary" value={editData.salary} onChange={handleEditChange} />
            </div>
            <div className="modal-buttons">
              <button className="btn btn-danger" onClick={saveEdit}>Save Changes</button>
              <button className="btn btn-outline-primary" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboardPage;