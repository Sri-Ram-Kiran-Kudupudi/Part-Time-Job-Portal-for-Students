// pages/NotFoundPage.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { AuthContext } from '../context/AuthContext';
import './css/NotFoundPage.css'; // <-- NEW IMPORT

const NotFoundPage = () => {
    const { user } = useContext(AuthContext);

    // Determine the correct dashboard route based on role
    const getDashboardRoute = (role) => {
        switch (role) {
            case 'seeker': return '/dashboard';
            case 'provider': return '/provider/dashboard';
            case 'admin': return '/admin/dashboard';
            default: return '/login'; // Default to login if not logged in
        }
    };

    const dashboardPath = getDashboardRoute(user.role);

    return (
        <div className="not-found-page-container bg-light-gray"> {/* <-- CUSTOM CLASS + GLOBAL BG */}
            <Header />

            {/* Content centered vertically and horizontally */}
            <div className="not-found-content-wrapper"> {/* <-- CUSTOM CLASS */}
                <div className="error-card card-shadow-2xl"> {/* <-- CUSTOM CLASS + GLOBAL SHADOW */}

                    {/* Optional Visual */}
                    <div className="error-icon text-primary"> {/* <-- CUSTOM CLASS + GLOBAL COLOR */}
                        ❓
                    </div>

                    <h1 className="error-code text-gray-900"> {/* <-- CUSTOM CLASS + GLOBAL COLOR */}
                        404
                    </h1>
                    <h2 className="error-title text-gray-900">
                        Page Not Found
                    </h2>
                    <p className="error-message text-gray-600"> {/* <-- CUSTOM CLASS + GLOBAL COLOR */}
                        The page you are looking for doesn’t exist or the URL is incorrect.
                    </p>

                    <div className="action-buttons-group"> {/* <-- CUSTOM CLASS for spacing/responsiveness */}
                        {/* Primary Button: Go to Dashboard */}
                        {user.isLoggedIn && (
                            <Link
                                to={dashboardPath}
                                className="btn-primary dashboard-btn" // <-- GLOBAL BUTTON CLASS + CUSTOM WIDTH
                            >
                                Go to Dashboard
                            </Link>
                        )}

                        {/* Secondary Text Link: Back to Home */}
                        <Link
                            to={user.isLoggedIn ? dashboardPath : '/login'}
                            className="link-secondary home-link" // <-- CUSTOM CLASS
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;