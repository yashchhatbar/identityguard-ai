import { Navigate, useLocation } from 'react-router-dom';

import { getStoredToken, getStoredUser } from '../lib/auth';

export default function ProtectedRoute({ children, role }) {
    const location = useLocation();
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (role && user?.role !== role) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
