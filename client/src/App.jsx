import FloatingShape from "./components/FloatingShape";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import LoadingSpinner from "./components/LoadingSpinner";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import AttendanceModule from "./pages/attendance/AttendanceModule";
import EmployeesListPage from "./pages/employee/EmployeesListPage";
import EmployeeProfileView from "./pages/employee/EmployeeProfileView";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard2";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LeaveModule from "./pages/leave/LeaveModule";
import PayrollModule from "./pages/payroll/PayrollModule";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
};

// redirect authenticated users to the appropriate dashboard
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    // Redirect to role-based dashboard
    const isAdmin = user.role === 'HR' || user.role === 'Admin';
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return children;
};

// Component to redirect based on role when accessing root
const RoleDashboardRedirect = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'HR' || user?.role === 'Admin';
  return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
};

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center relative overflow-hidden">
      <FloatingShape
        color="bg-black"
        size="w-64 h-64"
        top="-5%"
        left="10%"
        delay={0}
      />
      <FloatingShape
        color="bg-black"
        size="w-48 h-48"
        top="70%"
        left="80%"
        delay={5}
      />
      <FloatingShape
        color="bg-black"
        size="w-32 h-32"
        top="40%"
        left="-10%"
        delay={2}
      />
      <Outlet />
    </div>
  );
};

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleDashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectAuthenticatedUser>
                <SignUpPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectAuthenticatedUser>
                <LoginPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route
            path="/forgot-password"
            element={
              <RedirectAuthenticatedUser>
                <ForgotPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <RedirectAuthenticatedUser>
                <ResetPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />
        </Route>

        {/* Employee Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Attendance Module */}
        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute>
              <AttendanceModule />
            </ProtectedRoute>
          } 
        />

        {/* Employees List (Admin: all employees, Employee: self) */}
        <Route 
          path="/employees" 
          element={
            <ProtectedRoute>
              <EmployeesListPage />
            </ProtectedRoute>
          } 
        />

        {/* Legacy route - redirect to new employees route */}
        <Route 
          path="/employee" 
          element={<Navigate to="/employees" replace />} 
        />

        {/* Employee Profile View */}
        <Route 
          path="/employee/:id" 
          element={
            <ProtectedRoute>
              <EmployeeProfileView />
            </ProtectedRoute>
          } 
        />

        {/* My Profile shortcut */}
        <Route 
          path="/employee/me" 
          element={
            <ProtectedRoute>
              <EmployeeProfileView />
            </ProtectedRoute>
          } 
        />

        {/* Leaves Module */}
        <Route 
          path="/leaves" 
          element={
            <ProtectedRoute>
              <LeaveModule />
            </ProtectedRoute>
          } 
        />

        {/* Payroll Module */}
        <Route 
          path="/payroll" 
          element={
            <ProtectedRoute>
              <PayrollModule />
            </ProtectedRoute>
          } 
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
