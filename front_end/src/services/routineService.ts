import axios from 'axios';
import { Routine } from '../models/Routine';

const API_URL = 'http://localhost:8080/api/routines';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn("⚠️ No se encontró token en LocalStorage");
    return null;
  }

  const cleanToken = token.replace(/"/g, '');

  return {
    headers: {
      'Authorization': `Bearer ${cleanToken}`,
      'Content-Type': 'application/json'
    }
  };
};

export const getMyRoutines = async (): Promise<Routine[]> => {
  const config = getAuthHeader();

  if (!config) {
    throw new Error("No hay token disponible");
  }

  const response = await axios.get(`${API_URL}/myroutines`, config);
  return response.data;
};

export const updateExerciseStatus = async (exerciseId: number, completed: boolean) => {
  const config = getAuthHeader();
  if (!config) throw new Error("No autenticado");

  return await axios.patch(`${API_URL}/exercises/${exerciseId}/status`, null, {
    ...config,
    params: { completed }
  });
};