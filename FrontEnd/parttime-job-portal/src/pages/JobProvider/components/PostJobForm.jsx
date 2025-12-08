import React, { useState } from "react";
import { toast } from "react-toastify";
import { createJob } from "../../../service/api";
import "./PostJobForm.css";   // NEW CSS FILE IMPORT

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

const InputField = ({ label, name, value, onChange, type = "text" }) => (
    <div className="pf-form-group">
        <label className="pf-label">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="pf-input"
            required
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
    <div className="pf-form-group">
        <label className="pf-label">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="pf-input"
            required
        >
            {options.map((opt) => (
                <option key={opt} value={opt === "Select State" ? "" : opt}>
                    {opt}
                </option>
            ))}
        </select>
    </div>
);

const PostJobForm = ({ onJobSubmit }) => {
    const [jobData, setJobData] = useState({
        name: "", type: jobTypes[0], timing: "",
        salary: "", description: "", city: "",
        district: "", state: "",
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
            name: "", type: jobTypes[0], timing: "",
            salary: "", description: "", city: "",
            district: "", state: "",
        });
    };

    return (
        <div className="pf-card">
            <h2 className="pf-title">Post a New Job</h2>

            <form onSubmit={handleSubmit} className="pf-form">
                <InputField label="Job Name" name="name" value={jobData.name} onChange={handleChange} />
                <SelectField label="Job Type" name="type" value={jobData.type} onChange={handleChange} options={jobTypes} />
                <InputField label="Timing" name="timing" value={jobData.timing} onChange={handleChange} />
                <InputField label="Salary" name="salary" value={jobData.salary} onChange={handleChange} />
                <InputField label="City" name="city" value={jobData.city} onChange={handleChange} />
                <InputField label="District" name="district" value={jobData.district} onChange={handleChange} />
                <SelectField label="State" name="state" value={jobData.state} onChange={handleChange} options={STATES} />

                <div className="pf-form-group">
                    <label className="pf-label">Description</label>
                    <textarea
                        name="description"
                        rows="3"
                        value={jobData.description}
                        onChange={handleChange}
                        className="pf-input"
                    />
                </div>

                <button type="submit" className="pf-btn">Submit Job Post</button>
            </form>
        </div>
    );
};

export default PostJobForm;
