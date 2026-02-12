import React, { createContext, useState, useEffect } from 'react';
import api, { setAuthToken, getAuthToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await getAuthToken();
                if (token) {
                    // Fetch user profile from backend
                    const response = await api.get('/auth/profile');
                    setUser(response.data.user);
                }
            } catch (error) {
                console.log('Error loading user', error);
                // If token is invalid, clear it
                await setAuthToken(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            await setAuthToken(token);
            setUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await api.post('/auth/register', { username, email, password });
            const { token, user } = response.data;
            await setAuthToken(token);
            setUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        await setAuthToken(null);
        setUser(null);
    };

    const updateUser = (updates) => {
        setUser(prevUser => ({ ...prevUser, ...updates }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
