package org.valkyrapp.api.routine;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.valkyrapp.api.exception.ResourceNotFoundException;
import org.valkyrapp.api.usuario.User;
import org.valkyrapp.api.usuario.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoutineServiceImpl implements RoutineService {
    private final RoutineRepository routineRepository;
    private final UserRepository userRepository;
    private final ExerciseTrackerRepository exerciseTrackerRepository;

    @Override
    @Transactional
    public RoutineDTO saveRoutine(RoutineDTO routineDTO, String username){
        User user = userRepository.findByUsername(username)
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));
        
        Routine routine = RoutineMapper.convertToEntity(routineDTO);
        routine.setUser(user);
        
        if(routineDTO.getExercises() != null){
            routine.setExercises(routineDTO.getExercises().stream()
                    .map(exerDto -> {
                        ExerciseTracker exerciseTracker = new ExerciseTracker();
                        exerciseTracker.setName(exerDto.getName());
                        exerciseTracker.setSeries(exerDto.getSeries());
                        exerciseTracker.setReps(exerDto.getReps());
                        exerciseTracker.setWeight(exerDto.getWeight());
                        exerciseTracker.setIsCompleted(false);
                        exerciseTracker.setRoutine(routine);
                        return exerciseTracker;
                    }).collect(Collectors.toList()));
        }
        Routine saved = routineRepository.save(routine);
        return RoutineMapper.convertToDTO(saved);
    }

    @Override
    @Transactional
    public void updateExerciseStatus(Long id, boolean completed) {
        ExerciseTracker exercise = exerciseTrackerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado con ID: " + id));

        exercise.setIsCompleted(completed);

        exerciseTrackerRepository.save(exercise);
    }
    @Override
    public RoutineDTO getRoutineById(Long id) {
        return routineRepository.findById(id)
                .map(RoutineMapper::convertToDTO)
                .orElseThrow(()-> new ResourceNotFoundException("Rutina con ID " + id + " no encontrada"));
    }

    @Override
    public List<RoutineDTO> listAllRoutines(String username) {
        return routineRepository.findByUserUsername(username).stream()
                .map(RoutineMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteRoutine(Long id, String username) {
        if (!routineRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: Rutina no encontrada");
        }
        routineRepository.deleteById(id);
    }
}
