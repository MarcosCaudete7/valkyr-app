import axios from 'axios';
import { API_BASE_URL } from './api';

const API_URL = `${API_BASE_URL}/exercises`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    return { headers: { 'Authorization': `Bearer ${token}` } };
};

export interface Exercise {
    id: number;
    name: string;
    muscleGroup: string;
    description: string;
    equipment: string;
}

export const getAllExercises = async (): Promise<Exercise[]> => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};