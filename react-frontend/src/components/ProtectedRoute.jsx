import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin, isStaff, logout } = useAuth();

  // Check token expiry on every route access
  useEffect(() => {
    const checkTokenExpiry = () => {
      const tokenExpiry = localStorage.getItem('token_expiry');
      if (tokenExpiry) {
        const now = new Date().getTime();
        if (now > parseInt(tokenExpiry)) {
          console.log('Token expired during route access');
          logout();
        }
      }
    };

    checkTokenExpiry();
    // Check every minute if token has expired
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [logout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If route requires admin but user is staff, redirect to POS
  if (requireAdmin && isStaff) {
    return <Navigate to="/pos" replace />;
  }

  return children;
};

export default ProtectedRoute;
