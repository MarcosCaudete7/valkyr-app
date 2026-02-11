import axios from 'axios';

const API_URL = 'https://api.valkyrapp.com/api/v1';

const getAuthHeader = () => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) return {};
    return { headers: { 'Authorization': `Bearer ${token}` } };
};

export const getAiRoutine = async (ejercicio: string, tipo: string): Promise<string> => {

    const endpoint = tipo === 'powerlifting' ? '/routine/power' : '/routine/bodybuilding';

    const response = await axios.get(`${API_URL}${endpoint}`, {
        ...getAuthHeader(),
        params: { ejercicio }
    });
    return response.data;
};