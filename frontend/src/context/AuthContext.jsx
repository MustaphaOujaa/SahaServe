import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create a pre-configured axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage and sync with server
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        try {
          const response = await api.get('/profile');
          if (response.data && response.data.status === 'success') {
            const freshUser = response.data.data;
            setUser(freshUser);
            localStorage.setItem('auth_user', JSON.stringify(freshUser));
          }
        } catch (error) {
          console.error("Failed to sync profile on load:", error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Add interceptor to handle token injection dynamically and token expiration
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          config.headers['Authorization'] = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token is invalid or expired
          handleLogoutLocal();
          toast.error('Session expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const handleLogoutLocal = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
  };

  // Login with token (useful for OAuth callbacks like Google)
  const loginWithToken = async (authToken) => {
    try {
      setToken(authToken);
      localStorage.setItem('auth_token', authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      const response = await api.get('/profile');
      if (response.data && response.data.status === 'success') {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        toast.success('Successfully authenticated with Google!');
        return { success: true, user: userData };
      } else {
        throw new Error('Failed to retrieve profile.');
      }
    } catch (error) {
      handleLogoutLocal();
      const message = error.response?.data?.message || 'Google authentication failed.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Login action
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/login', { email, password });
      
      if (response.data && response.data.status === 'success') {
        const userData = response.data.user;
        const userToken = response.data.token;

        setUser(userData);
        setToken(userToken);

        // Store token in localStorage
        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('auth_token', userToken);

        // Set default Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        
        toast.success(response.data.message || 'Successfully logged in!');
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Login failed.');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Invalid email or password.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout action
  const logout = async () => {
    try {
      // Attempt backend logout, ignore error if it fails (e.g. server offline)
      await api.post('/logout').catch(() => {});
    } finally {
      handleLogoutLocal();
      toast.success('Logged out successfully.');
    }
  };

  // Send OTP (for registration step 1)
  const sendOtp = async (userData) => {
    try {
      // Map frontend fields (phone -> phone_number, address -> adress) to backend requirements
      const backendData = {
        name: userData.name,
        email: userData.email,
        adress: userData.address, // backend expects 'adress' with 1 'd'
        phone_number: userData.phone, // backend expects 'phone_number'
      };

      const response = await api.post('/send-otp', backendData);
      toast.success(response.data.message || 'OTP verification code sent to your email.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification code.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register action (verification step 2)
  const register = async (userData, otp) => {
    try {
      const backendData = {
        name: userData.name,
        email: userData.email,
        adress: userData.address,
        phone_number: userData.phone,
        password: userData.password,
        otp: otp,
      };

      const response = await api.post('/register', backendData);
      
      if (response.data && response.data.token) {
        const userData = response.data.user;
        const userToken = response.data.token;

        setUser(userData);
        setToken(userToken);

        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('auth_token', userToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

        toast.success('Registration successful! Welcome to SahaServe.');
        return { success: true, user: userData };
      } else {
        throw new Error('Registration failed.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP code or password setup.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Forgot password OTP request
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/forgotPassword', { email });
      if (response.data.status === 'success') {
        toast.success(response.data.message || 'OTP sent successfully!');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Failed to send OTP.');
        return { success: false };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'No user found with this email.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Reset password action
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await api.post('/resetPassword', { email, otp, newPassword });
      if (response.data.status === 'success') {
        toast.success(response.data.message || 'Password reset successfully!');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Failed to reset password.');
        return { success: false };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid or expired OTP code.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithToken,
        logout,
        sendOtp,
        register,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
