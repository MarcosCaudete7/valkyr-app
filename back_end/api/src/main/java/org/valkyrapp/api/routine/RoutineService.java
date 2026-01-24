package org.valkyrapp.api.routine;

import java.util.List;

public interface RoutineService {
    RoutineDTO saveRoutine(RoutineDTO routineDTO, String username);
    RoutineDTO getRoutineById(Long id);
    List<RoutineDTO> listAllRoutines(String username);
    void deleteRoutine(Long id, String username);
    void updateExerciseStatus(Long id, boolean completed);
}
