import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Si estamos en el móvil (donde localhost no es el ordenador, sino el propio móvil), 
// usamos la IP local del ordenador en la red Wi-Fi.
export const API_BASE_URL = Capacitor.isNativePlatform()
    ? 'http://192.168.0.82:8080/api'
    : 'https://api.valkyrapp.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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