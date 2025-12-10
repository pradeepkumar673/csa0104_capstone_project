import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { serverurl } from '../main.jsx';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await axios.get(`${serverurl}/api/users/profile`, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });
                    setUser(response.data);
                    setToken(storedToken);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${serverurl}/api/auth/login`, {
                Username: username,
                password: password
            }, {
                withCredentials: true
            });
            
            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await axios.post(`${serverurl}/api/auth/signup`, userData, {
                withCredentials: true
            });
            
            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            return { success: true };
        } catch (error) {
            console.error('Signup failed:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Signup failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await axios.get(`${serverurl}/api/auth/logout`, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put(`${serverurl}/api/users/profile`, profileData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(response.data.user);
            return { success: true };
        } catch (error) {
            console.error('Profile update failed:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Update failed' 
            };
        }
    };

    const value = {
        user,
        loading,
        token,
        login,
        signup,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};