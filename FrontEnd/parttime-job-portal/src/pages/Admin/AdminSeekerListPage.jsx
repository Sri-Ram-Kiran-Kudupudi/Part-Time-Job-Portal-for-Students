import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { toast } from "react-toastify";
import { getAllSeekers, deleteSeeker } from "../../service/api";
import "./AdminSeekerListPage.css";
import { IoArrowBack } from "react-icons/io5";

const AdminSeekerListPage = () => {
  const navigate = useNavigate();
  const [seekers, setSeekers] = useState([]);
  const [query, setQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedSeeker, setSelectedSeeker] = useState(null);

  const loadSeekers = async () => {
    try {
      const res = await getAllSeekers();
      setSeekers(res.data);
    } catch (err) {
      toast.error("Failed to load seekers");
    }
  };

  useEffect(() => {
    loadSeekers();
  }, []);

  const handleDeleteClick = (seeker) => {
    setSelectedSeeker(seeker);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSeeker(selectedSeeker.id);
      toast.success("Seeker deleted successfully");
      setShowModal(false);
      loadSeekers();
    } catch (err) {
      const backendMessage = err.response?.data;

      if (backendMessage?.includes("Cannot delete seeker")) {
        toast.error("This seeker cannot be deleted because they have active or accepted job applications.");
      } else {
        toast.error("Failed to delete seeker. Try again later.");
      }
    }
  };

  const filtered = seekers.filter(
    (s) =>
      s.fullName.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="admin-list-page-container bg-light-gray">
      <Header title="Job Seeker List" />

      <main className="admin-list-main-content">
        <button
        onClick={() => navigate("/admin/dashboard")}
        className="back-floating-btn"
      >
        <IoArrowBack size={22} color="black" />
      </button>


        <div className="admin-list-card">
          <h1 className="page-title">All Registered Job Seekers</h1>

          <input
            placeholder="Search seekers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="admin-search-input"
          />

          <div className="table-responsive">
            <table className="admin-seeker-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>City</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((s, index) => (
                  <tr key={s.id}>
                    <td>{index + 1}</td>
                    <td className="name-cell">{s.fullName}</td>
                    <td className="email-cell">{s.email}</td>
                    <td>{s.age}</td>
                    <td>{s.gender}</td>
                    <td>{s.city}</td>

                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteClick(s)}
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
            <p className="text-center text-gray-600 py-4">
              No seekers found.
            </p>
          )}
        </div>
      </main>

      {showModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h2>Delete Confirmation</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedSeeker.fullName}</strong>?
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

export default AdminSeekerListPage;
