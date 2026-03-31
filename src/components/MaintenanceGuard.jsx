import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoon from '../Maintainance/ComingSoon';

const MaintenanceGuard = ({ children }) => {
    const userRole = localStorage.getItem("userRole");
    const location = useLocation();

    // Check if the user is an admin or super admin
    // We also include 'staff' if they have dashboard access, but strictly following user prompt:
    const role = userRole?.toLowerCase();
    const isAuthorized = role === "admin" || role === "super admin";


    // Define paths that should ALWAYS be accessible (login/auth flow)
    const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

    const isAuthPath = authPaths.some(path => location.pathname.startsWith(path));
    const isDashboardPath = location.pathname.startsWith('/dashboard');

    // 1. If it's an auth path, let it through
    if (isAuthPath) {
        return children;
    }

    // 2. If it's the dashboard path, let it through (ProtectedRoute will handle real auth)
    if (isDashboardPath) {
        return children;
    }

    // 3. For ALL other pages (Public pages, etc.)
    // If user is NOT Admin or Super Admin, show Coming Soon
    if (!isAuthorized) {
        return <ComingSoon />;
    }

    // 4. Admin/Super Admin can see everything
    return children;
};

export default MaintenanceGuard;
