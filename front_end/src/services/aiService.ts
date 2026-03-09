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

export const analyzeFoodImage = async (base64Image: string): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/v1/analyze/food`, {
        image: base64Image
    }, getAuthHeader());
    
    // El backend devuelve un String JSON que Axios debería parsear, pero por si acaso
    return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
};