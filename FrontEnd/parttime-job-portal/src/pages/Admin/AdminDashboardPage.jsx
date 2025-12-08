// pages/AdminDashboardPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import './AdminDashboardPage.css'; // <-- Dedicated CSS

// --- Card Component (Classes Converted) ---
const AdminCard = ({ title, icon, to }) => (
    <Link 
        to={to} 
        className="admin-card card-link-effect" // Custom classes for styling/effect
    >
        <div className="admin-card-icon">{icon}</div>
        <h2 className="admin-card-title text-gray-900">{title}</h2>
    </Link>
);

const AdminDashboardPage = () => {
    return (
        <div className="admin-dashboard-page bg-light-gray">
            <Header title="Admin Dashboard" />
            
            <main className="admin-main-content">
                
                <h1 className="main-header-title text-gray-900 border-b text-center">
                    Platform Management Overview
                </h1>
                
                {/* 3 Large Rectangular Cards */}
                <div className="admin-card-group-spacing">
                    
                    <AdminCard 
                        title="Job Seeker List" 
                        icon="🧑‍💼" 
                        to="/admin/seekers" // CORRECT LINK
                    />
                    
                    <AdminCard 
                        title="Job Provider List" 
                        icon="🏢" 
                        to="/admin/providers" // CORRECT LINK
                    />
                    
                    <AdminCard 
                        title="Application Records" 
                        icon="📄" 
                        to="/admin/records" // CORRECT LINK
                    />
                </div>
                
            </main>
        </div>
    );
};

export default AdminDashboardPage;