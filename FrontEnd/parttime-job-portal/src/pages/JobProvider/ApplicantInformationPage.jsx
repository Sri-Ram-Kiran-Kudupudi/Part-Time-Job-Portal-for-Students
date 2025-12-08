import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { AuthContext } from '../../context/AuthContext';
import { getApplicantById } from '../../service/api';
import './ApplicantInformationPage.css';

const DetailRow = ({ label, value }) => (
    <div className="detail-row-flex">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value || "Not provided"}</span>
    </div>
);

const ApplicantInformationPage = () => {
    const { applicantId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [applicant, setApplicant] = useState(null);

    useEffect(() => {
        const fetchApplicant = async () => {
            try {
                const res = await getApplicantById(applicantId);
                setApplicant(res.data);
            } catch (err) {
                console.error("Failed to fetch applicant:", err);
            }
        };
        fetchApplicant();
    }, [applicantId]);

    if (!applicant)
        return <div className="loading-box">Loading applicant...</div>;

    const fullName = applicant.fullName || "Applicant";

    const isChatUnlocked =
        applicant.status === "both_accepted" &&
        user?.role?.toLowerCase() === "provider";

    return (
        <div className="applicant-info-page-container">
            <Header title="Applicant Profile" />

            <main className="applicant-info-main-content">

                <button onClick={() => navigate(-1)} className="btn-back-link">
                    ← Back to Applicant List
                </button>

                <div className="profile-card">

                    <div className="profile-avatar-large">
                        {fullName.charAt(0)}
                    </div>

                    <h1 className="profile-name">{fullName}</h1>

                    <div className="profile-details-list">
                        <DetailRow label="Age" value={applicant.age} />
                        <DetailRow label="Gender" value={applicant.gender} />
                        <DetailRow label="Skills" value={applicant.skills} />
                        <DetailRow label="Experience" value={applicant.experience} />
                        <DetailRow label="City" value={applicant.city} />
                        <DetailRow label="District" value={applicant.district} />
                        <DetailRow label="State" value={applicant.state} />
                        <DetailRow label="Status" value={applicant.status?.replace("_", " ")} />
                    </div>

                    {isChatUnlocked && (
                        <button
                            onClick={() => navigate(`/chat/${applicant.chatId}`)}
                            className="btn btn-primary chat-view-button"
                        >
                            View Chat
                        </button>
                    )}

                </div>
            </main>
        </div>
    );
};

export default ApplicantInformationPage;
