import axios from 'axios';

const API_URL = 'https://api.valkyrapp.com/api/exercises';

const getAuthHeader = () => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    return { headers: { 'Authorization': `Bearer ${token}` } };
};

export interface Exercise {
    id: number;
    name: string;
    muscleGroup: string;
    description: string;
}

export const getAllExercises = async (): Promise<Exercise[]> => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};