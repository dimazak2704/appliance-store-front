import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

interface RequireAuthProps {
    allowedRoles: string[];
}

export const RequireAuth = ({ allowedRoles }: RequireAuthProps) => {
    const { isAuthenticated, role } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />; // Or to a 403 Forbidden page
    }

    return <Outlet />;
};
