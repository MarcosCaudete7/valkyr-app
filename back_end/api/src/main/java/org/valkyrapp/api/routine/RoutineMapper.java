package org.valkyrapp.api.routine;

import org.springframework.stereotype.Component;
import org.valkyrapp.api.usuario.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Component
public class RoutineMapper {
    private Long id;
    private String name;
    private String description;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private Set<Muscles> muscles;
    private User user;

    public static RoutineDTO convertToDTO(Routine routine) {
        if (routine == null) return null;
        List<ExerciseTrackerDTO> exerciseDTO = routine.getExercises() != null ?
                routine.getExercises().stream()
                        .map(exercise -> ExerciseTrackerDTO.builder()
                                .id(exercise.getId())
                                .name(exercise.getName())
                                .series(exercise.getSeries())
                                .reps(exercise.getReps())
                                .weight(exercise.getWeight())
                                .isCompleted(exercise.getIsCompleted())
                                .build()
                        )
                        .toList() : null;

        return RoutineDTO.builder()
                .id(routine.getId())
                .name(routine.getName())
                .description(routine.getDescription())
                .isPublic(routine.isPublic())
                .createdAt(routine.getCreatedAt())
                .muscles(routine.getMuscles())
                .exercises(exerciseDTO)
                .creatorName(routine.getUser() != null ? routine.getUser().getUsername(): null)
                .build();

    }
    public static Routine convertToEntity(RoutineDTO routineDTO) {
        if (routineDTO == null) return null;
        return Routine.builder()
                .id(routineDTO.getId())
                .name(routineDTO.getName())
                .description(routineDTO.getDescription())
                .isPublic(routineDTO.isPublic())
                .createdAt(routineDTO.getCreatedAt())
                .muscles(routineDTO.getMuscles())
                .build();
    }
}
