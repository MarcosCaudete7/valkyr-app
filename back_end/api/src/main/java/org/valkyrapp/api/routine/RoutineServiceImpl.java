package org.valkyrapp.api.routine;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.valkyrapp.api.exception.ResourceNotFoundException;
import org.valkyrapp.api.usuario.User;
import org.valkyrapp.api.usuario.UserRepository;

import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoutineServiceImpl implements RoutineService {
    private final RoutineRepository routineRepository;
    private final UserRepository userRepository;
    private final ExerciseTrackerRepository exerciseTrackerRepository;

    @Override
    @Transactional
    public RoutineDTO saveRoutine(RoutineDTO routineDTO, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (routineDTO.getIsPublic() == null) {
            routineDTO.setIsPublic(false);
        }

        Routine routine = RoutineMapper.convertToEntity(routineDTO);
        routine.setUser(user);

        if (routineDTO.getExercises() != null) {
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
        String currentUsername = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication())
                .getName();

        return routineRepository.findById(id)
                .map(routine -> {
                    if (!routine.getUser().getUsername().equals(currentUsername)) {
                        try {
                            throw new AccessDeniedException("No tienes permisos para acceder a esta rutina.");
                        } catch (AccessDeniedException e) {
                            throw new RuntimeException(e);
                        }
                    }
                    return RoutineMapper.convertToDTO(routine);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Rutina no encontrada"));
    }

    @Override
    public List<RoutineDTO> listAllRoutines(String username) {
        return routineRepository.findByUserUsername(username).stream()
                .map(RoutineMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoutineDTO> listPublicRoutinesByUserId(Long userId) {
        return routineRepository.findByUserIdAndIsPublicTrue(userId).stream()
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

    @Override
    @Transactional
    public RoutineDTO updateRoutine(Long id, RoutineDTO routineDTO, String username) {
        Routine existingRoutine = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rutina no encontrada con ID: " + id));

        if (!existingRoutine.getUser().getUsername().equals(username)) {
            try {
                throw new AccessDeniedException("No tienes permisos para modificar esta rutina.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        existingRoutine.setName(routineDTO.getName());
        existingRoutine.setDescription(routineDTO.getDescription());

        if (routineDTO.getIsPublic() != null) {
            existingRoutine.setIsPublic(routineDTO.getIsPublic());
        }

        if (routineDTO.getExercises() != null) {
            // Eliminar ejercicios que ya no están en la lista (basado en el nombre por
            // ahora si no hay un id único estable en el front, pero mejor buscar por su ID
            // si viene en el DTO)
            Map<Long, ExerciseTrackerDTO> incomingExercises = routineDTO.getExercises().stream()
                    .filter(dto -> dto.getId() != null)
                    .collect(Collectors.toMap(ExerciseTrackerDTO::getId, dto -> dto));

            List<ExerciseTracker> toRemove = new ArrayList<>();
            for (ExerciseTracker existingTracker : existingRoutine.getExercises()) {
                if (!incomingExercises.containsKey(existingTracker.getId())) {
                    toRemove.add(existingTracker); // The exercise was removed by user
                } else {
                    // Update existing exercise
                    ExerciseTrackerDTO updateDto = incomingExercises.get(existingTracker.getId());
                    existingTracker.setSeries(updateDto.getSeries());
                    existingTracker.setReps(updateDto.getReps());
                    existingTracker.setWeight(updateDto.getWeight());
                }
            }
            existingRoutine.getExercises().removeAll(toRemove);
            exerciseTrackerRepository.deleteAll(toRemove);

            // Añadir nuevos ejercicios (los que no tienen ID aún)
            List<ExerciseTrackerDTO> newExercises = routineDTO.getExercises().stream()
                    .filter(dto -> dto.getId() == null)
                    .collect(Collectors.toList());

            for (ExerciseTrackerDTO newDto : newExercises) {
                ExerciseTracker newTracker = new ExerciseTracker();
                newTracker.setName(newDto.getName());
                newTracker.setSeries(newDto.getSeries());
                newTracker.setReps(newDto.getReps());
                newTracker.setWeight(newDto.getWeight());
                newTracker.setIsCompleted(false);
                newTracker.setRoutine(existingRoutine);
                existingRoutine.getExercises().add(newTracker);
            }
        }

        Routine savedRoute = routineRepository.save(existingRoutine);
        return RoutineMapper.convertToDTO(savedRoute);
    }
}
