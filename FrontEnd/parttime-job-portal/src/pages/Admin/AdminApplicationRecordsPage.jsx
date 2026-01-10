import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllApplicationRecords } from '../../service/api';
import './AdminApplicationRecordsPage.css';
import { IoArrowBack } from "react-icons/io5";

const getStatusBadge = (status = "") => {
  let colorClass = "badge-pending";

  if (status === "both_accepted") colorClass = "badge-accepted-green";
  else if (status.toLowerCase().includes("rejected") || status.includes("Not"))
    colorClass = "badge-rejected-red";

  return <span className={`status-badge ${colorClass}`}>{status}</span>;
};

const generateHTML = (record) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Match Record - ${record.jobName}</title>

<style>
  body { font-family: Arial; background:#f4f6f9; padding:20px; }
  .card { background:white; padding:20px; border-radius:12px; max-width:650px; margin:auto; box-shadow:0 4px 18px rgba(0,0,0,0.15); }
  h1 { color:#0a63c4; }
  h2 { margin-top:20px; padding-bottom:5px; border-bottom:2px solid #e5e7eb; }
  p { margin:6px 0; font-size:15px; }
</style>

</head>
<body>
  <div class="card">
    <h1>Job Match Record</h1>

    <h2>Agreement Proof</h2>
    <p><strong>Agreement ID:</strong> ${record.id}</p>
    <p><strong>Status:</strong> ${record.status}</p>
    <p><strong>Agreement Date:</strong> ${record.agreeDate || "N/A"}</p>

    <h2>Provider Details</h2>
    <p><strong>Name:</strong> ${record.providerName}</p>
    <p><strong>Email:</strong> ${record.providerEmail}</p>
    <p><strong>Phone:</strong> ${record.providerPhone}</p>

    <h2>Job Seeker Details</h2>
    <p><strong>Name:</strong> ${record.seekerName}</p>
    <p><strong>Email:</strong> ${record.seekerEmail}</p>
    <p><strong>Phone:</strong> ${record.seekerPhone}</p>

    <h2>Job Information</h2>
    <p><strong>Title:</strong> ${record.jobName}</p>
    <p><strong>Type:</strong> ${record.jobType}</p>
    <p><strong>Timing:</strong> ${record.timing}</p>
    <p><strong>Category:</strong> ${record.category}</p>
  </div>
</body>
</html>
`;

const PDFDownloadPopup = ({ record, onClose }) => {
  const handleDownload = () => {
    const htmlContent = generateHTML(record);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `MatchRecord_${record.id}.html`;
    a.click();

    URL.revokeObjectURL(url);
    toast.success("Record downloaded!");
    onClose();
  };

  return (
    <div className="modal-overlay-large">
      <div className="modal-content-large">
        <button className="modal-close-btn" onClick={onClose}>×</button>

        <h2 className="modal-title">Job Match Record Preview</h2>

        <div className="preview-box">
          <h3 className="preview-section-title">Agreement Proof</h3>
          <p><strong>Agreement ID:</strong> {record?.id}</p>
          <p><strong>Status:</strong> {record?.status}</p>
          <p><strong>Date:</strong> {record?.agreeDate || "N/A"}</p>

          <h3 className="preview-section-title">Provider Details</h3>
          <p><strong>Name:</strong> {record?.providerName}</p>
          <p><strong>Email:</strong> {record?.providerEmail}</p>
          <p><strong>Phone:</strong> {record?.providerPhone}</p>

          <h3 className="preview-section-title">Seeker Details</h3>
          <p><strong>Name:</strong> {record?.seekerName}</p>
          <p><strong>Email:</strong> {record?.seekerEmail}</p>
          <p><strong>Phone:</strong> {record?.seekerPhone}</p>

          <h3 className="preview-section-title">Job Information</h3>
          <p><strong>Job:</strong> {record?.jobName}</p>
          <p><strong>Type:</strong> {record?.jobType}</p>
          <p><strong>Timing:</strong> {record?.timing}</p>
          <p><strong>Category:</strong> {record?.category}</p>
        </div>

        <div className="modal-btn-row">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleDownload}>Download</button>
        </div>
      </div>
    </div>
  );
};

const AdminApplicationRecordsPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    try {
      const res = await getAllApplicationRecords();
      setRecords(res.data || []);
    } catch {
      toast.error("Failed to load records");
    }
  };

  const filtered = records.filter(r =>
    ((r?.jobName || "") + (r?.providerName || "") + (r?.seekerName || ""))
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <Header title="Application Records" />

      <main className="records-main-content">
        <button onClick={() => navigate("/admin/dashboard")} className="back-floating-btn">
          <IoArrowBack size={22} color="black" />
        </button>

        <div className="records-card">
          <h1 className="page-title">Job Match Records</h1>

          <input
            className="admin-search-input"
            placeholder="Search job / provider / seeker..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <table className="records-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Job</th>
                <th>Seeker</th>
                <th>Status</th>
                <th>Download</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r, i) => (
                <tr key={r?.id || i}>
                  <td>{i + 1}</td>

                  <td>
                    <strong className="text-blue">{r?.jobName}</strong> ({r?.jobType})
                    <br />
                    <small>by <span className="text-green">{r?.providerName}</span></small>
                  </td>

                  <td className="text-purple">{r?.seekerName}</td>

                  <td>{getStatusBadge(r?.status)}</td>

                  <td>
                    {r?.status === "both_accepted" && (
                      <button className="btn-download" onClick={() => setSelectedRecord(r)}>
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <p className="no-data-text">No records found.</p>}
        </div>
      </main>

      {selectedRecord && (
        <PDFDownloadPopup record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
};

export default AdminApplicationRecordsPage;
