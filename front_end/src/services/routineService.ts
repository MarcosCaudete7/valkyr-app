import axios from 'axios';
import { Routine } from '../models/Routine';

const API_URL = 'https://api.valkyrapp.com/api/routines';

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

export const getRoutineById = async (id: number): Promise<Routine> => {
  const config = getAuthHeader();

  if (!config) {
    throw new Error("No autenticado");
  }

  const response = await axios.get(`${API_URL}/${id}`, config);
  return response.data;
};

export const getPublicRoutinesByUserId = async (userId: string | number): Promise<Routine[]> => {
  const config = getAuthHeader();

  if (!config) {
    throw new Error("No autenticado");
  }

  const response = await axios.get(`${API_URL}/user/${userId}/public`, config);
  return response.data;
};

export const updateExerciseStatus = async (exerciseId: number, completed: boolean) => {
  const config = getAuthHeader();

  if (!config) throw new Error("No autenticado");

  return await axios.patch(
    `${API_URL}/exercises/${exerciseId}/status`,
    null,
    {
      ...config,
      params: { completed }
    }
  );
};

export const createRoutine = async (routineData: any) => {
  const config = getAuthHeader();
  if (!config) throw new Error("No autenticado");

  const payload = {
    name: routineData.name,
    description: routineData.description,
    isPublic: routineData.isPublic || false,
    exercises: routineData.exercises.map((ex: any) => ({
      id: ex.id ? parseInt(ex.id) : null,
      name: ex.name,
      series: parseInt(ex.series) || 0,
      reps: parseInt(ex.reps) || 0,
      weight: parseFloat(ex.weight) || 0,
      isCompleted: false
    }))
  };

  const response = await axios.post(`${API_URL}`, payload, config);
  return response.data;
};

export const updateRoutine = async (id: number, routineData: any) => {
  const config = getAuthHeader();
  if (!config) throw new Error("No autenticado");

  const payload = {
    name: routineData.name,
    description: routineData.description,
    isPublic: routineData.isPublic !== undefined ? routineData.isPublic : false,
    exercises: routineData.exercises.map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      series: parseInt(ex.series) || 0,
      reps: parseInt(ex.reps) || 0,
      weight: parseFloat(ex.weight) || 0,
      isCompleted: ex.isCompleted || false
    }))
  };

  const response = await axios.put(`${API_URL}/${id}`, payload, config);
  return response.data;
};