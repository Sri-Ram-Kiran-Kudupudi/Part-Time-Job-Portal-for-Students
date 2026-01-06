// pages/AdminDashboardPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineUsers, 
  HiOutlineClipboardList 
} from 'react-icons/hi';

import Header from '../../components/Header';
import './AdminDashboardPage.css';

const AdminCard = ({ title, icon: Icon, to }) => (
    <Link to={to} className="admin-card">
        <div className="admin-card-icon-wrapper">
            <Icon className="admin-card-icon" />
        </div>

        <h2 className="admin-card-title">{title}</h2>
    </Link>
);

const AdminDashboardPage = () => {
    return (
        <div className="admin-dashboard-page">
            <Header title="Admin Dashboard" />

            <main className="admin-main-content">
                <header className="admin-welcome-section">
                    <h1 className="main-header-title">
                       Administration Dashboard
                    </h1>
                    <p className="main-header-subtitle">
                        Monitor and manage all platform entities from one central location.
                    </p>
                </header>

                <div className="admin-card-grid">

                    <AdminCard 
                        title="Job Seeker List"
                        icon={HiOutlineUsers}
                        to="/admin/seekers"
                    />

                    <AdminCard 
                        title="Job Provider List"
                        icon={HiOutlineUsers}
                        to="/admin/providers"
                    />

                    <AdminCard 
                        title="Application Records"
                        icon={HiOutlineClipboardList}
                        to="/admin/records"
                    />

                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
