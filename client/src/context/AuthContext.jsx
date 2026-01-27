import React, { createContext, useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        if (localStorage.getItem('token')) {
            try {
                const res = await axios.get('/auth/me');
                setUser(res.data);
            } catch (err) {
                console.error("Load User Error:", err);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUser();
    }, []);

    const loginUser = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            await loadUser();
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    };

    const loginBatch = async (username, password) => {
        try {
            const res = await axios.post('/auth/login-batch', { username, password });
            localStorage.setItem('token', res.data.token);
            await loadUser();
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    };

    const registerUser = async (formData) => {
        try {
            const res = await axios.post('/auth/register-public', formData);
            localStorage.setItem('token', res.data.token);
            await loadUser();
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, loginBatch, registerUser, logout, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};
