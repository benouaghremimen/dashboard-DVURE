import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ClubDashboard from '../pages/club/ClubDashboard';
import ClubReservationsPage from '../pages/club/ClubReservationsPage';
import CalendarPage from '../pages/club/CalendarPage';
import ReservationsManagementPage from '../pages/admin/ReservationsManagementPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersManagementPage from '../pages/admin/UsersManagementPage';
import RoomsManagementPage from '../pages/admin/RoomsManagementPage';
import NewReservationPage from '../pages/club/NewReservationPage';
import EditReservationPage from '../pages/club/EditReservationPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { user } = useAuth();
    const userRole = String(user?.role || '').toUpperCase();
    const expectedRole = String(role || '').toUpperCase();

    if (!user) return <Navigate to="/login" />;
    if (role && userRole !== expectedRole)
        return <Navigate to={userRole === 'ADMIN' ? "/admin/dashboard" : "/club/dashboard"} />;

    return children;
};

export default function AppRouter() {
    const { user } = useAuth();
    const userRole = String(user?.role || '').toUpperCase();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route
                    path="/"
                    element={
                        user ? (
                            <Navigate to={userRole === 'ADMIN' ? "/admin" : "/club/dashboard"} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />

                <Route
                    path="/club/dashboard"
                    element={
                        <PrivateRoute role="CLUB">
                            <ClubDashboard />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/club/reservations"
                    element={
                        <PrivateRoute role="CLUB">
                            <ClubReservationsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/club/requests"
                    element={
                        <PrivateRoute role="CLUB">
                            <ClubReservationsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/club/new-request"
                    element={
                        <PrivateRoute role="CLUB">
                            <NewReservationPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/club/edit-request/:id"
                    element={
                        <PrivateRoute role="CLUB">
                            <EditReservationPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/club/calendar"
                    element={
                        <PrivateRoute role="CLUB">
                            <CalendarPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/change-password"
                    element={
                        <PrivateRoute>
                            <ChangePasswordPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <PrivateRoute role="ADMIN">
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />

                {/* Maintain legacy /admin/dashboard route if needed, or just redirect */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <PrivateRoute role="ADMIN">
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/reservations"
                    element={
                        <PrivateRoute role="ADMIN">
                            <ReservationsManagementPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <PrivateRoute role="ADMIN">
                            <UsersManagementPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/rooms"
                    element={
                        <PrivateRoute role="ADMIN">
                            <RoomsManagementPage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
