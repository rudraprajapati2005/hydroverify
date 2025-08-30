import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Create axios instance with fixed backend URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // force all calls to backend
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Attach token to axios instance
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token: authToken } = response.data.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Signup
  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      const { user: newUser, token: authToken } = response.data.data;

      setUser(newUser);
      setToken(authToken);
      localStorage.setItem('token', authToken);

      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token: newToken } = response.data.data;

      setToken(newToken);
      localStorage.setItem('token', newToken);
      return { success: true };
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return { success: false };
    }
  };

  const hasRole = (role) => user && user.role === role;
  const hasAnyRole = (roles) => user && roles.includes(user.role);

  const value = {
    user,
    loading,
    token,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
