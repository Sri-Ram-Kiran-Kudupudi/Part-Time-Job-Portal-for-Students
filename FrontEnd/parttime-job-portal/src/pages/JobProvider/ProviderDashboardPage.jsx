
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import ProviderJobCard from './ProviderJobCard';
import './ProviderDashboardPage.css';
import { toast } from "react-toastify";

import {
    createJob,
    getProviderJobs,
    updateProviderJob, 
    deleteProviderJob,
} from "../../service/api";

// --- GLOBAL CONSTANTS ---
const STATES = ["Select State", "Andhra Pradesh", "Telangana", "Delhi"];

const jobTypes = [
    "Full Time",
    "Part Time",
    "One-Day Job",
    "Weekend Job",
    "Evening Job",
    "Monthly Job",
    "Urgent / Today Only Job",
];

const InputField = ({ label, name, type = "text", value, onChange }) => (
    <div className="form-group mb-4">
        <label htmlFor={name} className="form-label">{label}</label>
        <input
            id={name}
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
        <label htmlFor={name} className="form-label">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required
            className="form-control-base"
        >
            {options.map((option) => (
                <option key={option} value={option === "Select State" ? "" : option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);

// --- EDIT JOB MODAL ---
const EditJobModal = ({ job, onUpdate, onClose }) => {
    const [jobData, setJobData] = useState({
        name: job.title || '', type: job.type || jobTypes[0], timing: job.timing || '',
        salary: job.salary || '', description: job.description || '', city: job.city || '',
        district: job.district || '', state: job.state || '',
    });

    const handleChange = (e) => {
        setJobData({ ...jobData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            title: jobData.name,
            type: jobData.type,
            timing: jobData.timing,
            salary: jobData.salary,
            description: jobData.description,
            city: jobData.city,
            district: jobData.district,
            state: jobData.state,
        };

        try {
            const res = await updateProviderJob(job.id, payload);
            onUpdate(job.id, res.data);
            toast.success("Job updated successfully!");
            onClose();
        } catch (err) {
            toast.error("Failed to update job");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="dashboard-card edit-job-modal">
                <h2 className="form-title border-b pb-2">Edit Job: {job.title}</h2>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>

                <form onSubmit={handleSubmit} className="form-spacing">
                    <InputField label="Job Name" name="name" value={jobData.name} onChange={handleChange} />
                    <SelectField label="Job Type" name="type" value={jobData.type} options={jobTypes} onChange={handleChange} />
                    <InputField label="Timing" name="timing" value={jobData.timing} onChange={handleChange} />
                    <InputField label="Salary" name="salary" value={jobData.salary} onChange={handleChange} />
                    <InputField label="City" name="city" value={jobData.city} onChange={handleChange} />
                    <InputField label="District" name="district" value={jobData.district} onChange={handleChange} />
                    <SelectField label="State" name="state" value={jobData.state} options={STATES} onChange={handleChange} />
                    <div className="form-group mb-4">
                        <label className="form-label">Description</label>
                        <textarea name="description" value={jobData.description} onChange={handleChange} rows="3" className="form-control-base"></textarea>
                    </div>
                    <button type="submit" className="btn-primary form-submit-btn mt-4">Apply Changes 📝</button>
                </form>
            </div>
        </div>
    );
};

// --- POST JOB FORM ---
const PostJobForm = ({ onJobSubmit }) => {
    const [jobData, setJobData] = useState({
        name: "", type: jobTypes[0], timing: "", salary: "", description: "", city: "", district: "", state: "",
    });

    const handleChange = (e) => {
        setJobData({ ...jobData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            title: jobData.name,
            type: jobData.type,
            timing: jobData.timing,
            salary: jobData.salary,
            description: jobData.description,
            city: jobData.city,
            district: jobData.district,
            state: jobData.state,
        };

        try {
            const res = await createJob(payload);
            onJobSubmit(res.data);
            toast.success("Job posted successfully!");
        } catch (err) {
            toast.error("Failed to post job");
        }

        setJobData({
            name: "", type: jobTypes[0], timing: "", salary: "",
            description: "", city: "", district: "", state: "",
        });
    };

    return (
        <div className="dashboard-card job-list-wrapper form-sticky">
            <h2 className="form-title border-b pb-2">Post a New Job</h2>
            <form onSubmit={handleSubmit} className="form-spacing">
                <InputField label="Job Name" name="name" value={jobData.name} onChange={handleChange} />
                <SelectField label="Job Type" name="type" value={jobData.type} options={jobTypes} onChange={handleChange} />
                <InputField label="Timing" name="timing" value={jobData.timing} onChange={handleChange} />
                <InputField label="Salary" name="salary" value={jobData.salary} onChange={handleChange} />
                <InputField label="City" name="city" value={jobData.city} onChange={handleChange} />
                <InputField label="District" name="district" value={jobData.district} onChange={handleChange} />
                <SelectField label="State" name="state" value={jobData.state} options={STATES} onChange={handleChange} />
                <div className="form-group mb-4">
                    <label className="form-label">Description</label>
                    <textarea name="description" value={jobData.description} onChange={handleChange} rows="3" className="form-control-base"></textarea>
                </div>
                <button type="submit" className="btn-primary form-submit-btn">Submit Job Post</button>
            </form>
        </div>
    );
};

// ================================================================
// MAIN PROVIDER DASHBOARD PAGE WITH DELETE MODAL + TOASTS
// ================================================================

const ProviderDashboardPage = () => {
    const [jobs, setJobs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);

    // DELETE MODAL
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        getProviderJobs()
            .then((res) => setJobs(res.data))
            .catch(() => toast.error("Failed to load jobs"));
    }, []);

    const handleJobSubmit = (job) => {
        setJobs(prev => [job, ...prev]);
    };

    const handleJobUpdate = (jobId, updatedJobData) => {
        setJobs(prev =>
            prev.map(job =>
                job.id === jobId ? { ...job, ...updatedJobData } : job
            )
        );
    };

    const handleJobEdit = (job) => {
        setJobToEdit(job);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setJobToEdit(null);
    };

    // OPEN DELETE MODAL
    const askDelete = (job) => {
        setSelectedJob(job);
        setShowDeleteModal(true);
    };

    // CONFIRM DELETE
    const confirmDelete = async () => {
        if (!selectedJob) return;

        try {
            await deleteProviderJob(selectedJob.id);
            setJobs(prev => prev.filter(j => j.id !== selectedJob.id));
            toast.success("Job deleted successfully!");
        } catch (err) {
            toast.error("Failed to delete job");
        }

        setShowDeleteModal(false);
        setSelectedJob(null);
    };

    return (
        <div className="provider-dashboard-page bg-light-gray">
            <Header title="Job Provider Dashboard" />

            <main className="container-lg py-5">
                <div className="row g-4">
                    <section className="col-lg-5">
                        <PostJobForm onJobSubmit={handleJobSubmit} />
                    </section>

                    <section className="col-lg-7">
                        <div className="dashboard-card">
                            <h2>Your Jobs</h2>

                            <div className="job-list-container no-gap">
                                {jobs.map((job) => (
                                    <ProviderJobCard
                                        key={job.id}
                                        job={job}
                                        onDelete={() => askDelete(job)}
                                        onEdit={handleJobEdit}
                                    />
                                ))}
                            </div>

                            {jobs.length === 0 && (
                                <p className="text-center text-gray-500 mt-4">
                                    No jobs posted yet.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* EDIT MODAL */}
            {isModalOpen && jobToEdit && (
                <EditJobModal
                    job={jobToEdit}
                    onUpdate={handleJobUpdate}
                    onClose={handleCloseModal}
                />
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Confirm Delete</h3>
                        <p>
                            Are you sure you want to delete job: <br />
                            <b>{selectedJob?.title}</b>?
                        </p>

                        <div className="modal-buttons">
                            <button className="btn btn-danger" onClick={confirmDelete}>
                                Yes, Delete
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
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

export default ProviderDashboardPage;