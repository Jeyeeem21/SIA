import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createAuthSignature, validateAuthData } from '../utils/security';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Auto logout after 30 minutes of inactivity
  useEffect(() => {
    if (!user) return;

    let inactivityTimer;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      // Auto logout after 30 minutes (1800000 ms)
      inactivityTimer = setTimeout(() => {
        console.log('Auto logout due to inactivity');
        logout();
      }, 1800000);
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [user]);

  // Check if user is logged in on mount and validate token with backend
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    const tokenExpiry = localStorage.getItem('token_expiry');
    
    if (token && userData && tokenExpiry) {
      // Verify data integrity - check if localStorage was tampered with
      if (!validateAuthData()) {
        console.warn('Auth data integrity check failed - possible tampering detected');
        logout();
        setLoading(false);
        return;
      }

      // Check if token is expired
      const now = new Date().getTime();
      if (now > parseInt(tokenExpiry)) {
        console.log('Token expired');
        logout();
        setLoading(false);
        return;
      }

      try {
        // Validate token with backend
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://127.0.0.1:8000/api/user', {
          withCredentials: true,
        });

        // If backend validates the token, set user data from backend response
        if (response.data) {
          setUser(response.data);
          // Update stored user data with fresh data from backend
          localStorage.setItem('user_data', JSON.stringify(response.data));
          
          // Regenerate signature with fresh data
          const signature = createAuthSignature(token, response.data, tokenExpiry);
          localStorage.setItem('auth_signature', signature);
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        // Token is invalid, clear everything
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      // Use API endpoint (no CSRF protection needed for API routes)
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true, // Important for Laravel Sanctum
      });

      if (response.data.user) {
        const userData = response.data.user;
        const token = response.data.token || 'session_based';
        
        // Set token expiry (24 hours from now)
        const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        
        // Create integrity signature
        const signature = createAuthSignature(token, userData, expiryTime.toString());
        
        // Store user data, token, expiry, and signature
        localStorage.setItem('user_data', JSON.stringify(userData));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token_expiry', expiryTime.toString());
        localStorage.setItem('login_timestamp', new Date().getTime().toString());
        localStorage.setItem('auth_signature', signature);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        
        // Redirect based on role
        if (userData.role === 'staff' || userData.role === 'Staff') {
          navigate('/pos');
        } else {
          navigate('/dashboard');
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to invalidate token
      await axios.post('http://127.0.0.1:8000/api/logout', {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data from localStorage
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('login_timestamp');
      localStorage.removeItem('auth_signature');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      navigate('/login');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'Admin',
    isStaff: user?.role === 'staff' || user?.role === 'Staff',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
