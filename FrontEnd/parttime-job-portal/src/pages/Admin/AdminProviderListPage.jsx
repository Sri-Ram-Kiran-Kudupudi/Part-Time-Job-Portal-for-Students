import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { toast } from "react-toastify";
import { getAllProviders, deleteProvider } from "../../service/api";
import "./AdminProviderListPage.css";

const AdminProviderListPage = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [query, setQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const res = await getAllProviders();
      setProviders(res.data);
    } catch (error) {
      toast.error("Failed to load providers");
    }
  };

  const openDeleteModal = (provider) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProvider(selectedProvider.id);
      toast.success("Provider deleted successfully");
      setShowModal(false);
      loadProviders();
    } catch (err) {
      const backendMessage = err.response?.data;

      if (backendMessage?.includes("Cannot delete provider")) {
        toast.error("This provider cannot be deleted because they have active or accepted job applications.");
      } else {
        toast.error("Failed to delete provider. Try again later.");
      }
    }
  };

  const filtered = providers.filter(
    (p) =>
      p.fullName.toLowerCase().includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="admin-list-page-container">
      <Header title="Job Provider List" />

      <main className="admin-list-main-content">
        <button onClick={() => navigate(-1)} className="btn-back-link">
          ← Back to Dashboard
        </button>

        <div className="admin-list-card">
          <h1 className="page-title">All Registered Job Providers</h1>

          <input
            aria-label="Search providers"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="admin-search-input"
          />

          <div className="table-responsive">
            <table className="provider-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p, index) => (
                  <tr key={p.id}>
                    <td>{index + 1}</td>
                    <td className="name-text">{p.fullName}</td>
                    <td>{p.age}</td>
                    <td className="email-text">{p.email}</td>
                    <td>{p.gender}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => openDeleteModal(p)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="no-data-text">No job providers found.</p>
          )}
        </div>
      </main>

      {showModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h2>Delete Provider?</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedProvider.fullName}</strong>?
            </p>

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviderListPage;
