// ProviderJobCard.js (FINAL)

import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProviderJobCard.css";

const ProviderJobCard = ({ job, onDelete, onEdit }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/provider/job/${job.id}`);
    };

    return (
        <div
            className="provider-job-card card-shadow"
            onClick={handleViewDetails}
        >
            <div className="card-info-area">
                <h3 className="job-title-h3 text-gray-900">{job.title}</h3>

                <div className="job-meta-flex text-gray-600">
                    <span>{job.type}</span>
                    <span> {job.city}</span>
                </div>
            </div>

            <div className="card-actions-area">
                {/* ✅ DYNAMIC APPLICANT COUNT */}
               

                <div className="d-flex gap-2 button-group-sm">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(job);
                        }}
                        className="btn-edit-action"
                    >
                        Edit
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(job.id);
                        }}
                        className="btn-delete-action"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProviderJobCard;
