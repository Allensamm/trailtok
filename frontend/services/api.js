import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Production API URL - will be updated after deployment
const BASE_URL = __DEV__ 
  ? 'http://192.168.1.122:5000/api' 
  : 'https://movie-app-backend.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const setAuthToken = async (token) => {
    if (token) {
        await SecureStore.setItemAsync('token', token);
    } else {
        await SecureStore.deleteItemAsync('token');
    }
};

export const getAuthToken = async () => {
    return await SecureStore.getItemAsync('token');
};

export default api;
