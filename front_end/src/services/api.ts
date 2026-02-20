import axios from 'axios';

// Cambiado a la IP Local del PC para que la APK de Android pueda comunicarse con tu backend local
const BASE_URL = 'http://api.valkyrapp.com/api';

const api = axios.create({
    baseURL: BASE_URL,
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