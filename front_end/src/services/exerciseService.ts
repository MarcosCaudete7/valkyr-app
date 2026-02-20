import axios from 'axios';

const API_URL = 'http://192.168.0.82:8080/api/exercises';

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