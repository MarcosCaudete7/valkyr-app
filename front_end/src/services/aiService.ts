import axios from 'axios';
import { API_BASE_URL } from './api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) return {};
    return { headers: { 'Authorization': `Bearer ${token}` } };
};

export const getAiRoutine = async (ejercicio: string, tipo: string): Promise<string> => {

    const endpoint = tipo === 'powerlifting' ? '/v1/routine/power' : '/v1/routine/bodybuilding';

    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        ...getAuthHeader(),
        params: { ejercicio }
    });
    return response.data;
};