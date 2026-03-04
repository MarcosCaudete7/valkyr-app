import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Determinamos la URL base dinámicamente según el entorno
export const API_BASE_URL = Capacitor.isNativePlatform()
    ? 'https://api.valkyrapp.com/api'
    : (window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : 'https://api.valkyrapp.com/api');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    register: (userData: any) => api.post('/auth/register', userData),
    login: (credentials: any) => api.post('/auth/login', credentials),

    checkUnique: async (field: 'username' | 'email', value: string): Promise<boolean> => {
        try {
            const response = await api.get(`/auth/check-${field}`, {
                params: { [field]: value }
            });
            return response.data === true;
        } catch (error) {
            console.error("Error de conexion:", error);
            return false;
        }
    }
};

export default api;