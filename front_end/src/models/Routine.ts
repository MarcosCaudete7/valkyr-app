// src/models/Routine.ts
export interface Routine {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  muscles: string[];
  exercises: ExerciseLine[];
}

export interface ExerciseLine {
  id: number;
  name: string;
  series: number;
  reps: number;
  weight: number;
  isCompleted: boolean;
}

