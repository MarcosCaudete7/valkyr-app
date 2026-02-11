package org.valkyrapp.api.routine;

import org.springframework.stereotype.Component;
import org.valkyrapp.api.usuario.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class RoutineMapper {

    public static RoutineDTO convertToDTO(Routine routine) {
        if (routine == null) return null;

        List<ExerciseTrackerDTO> exerciseDTOs = routine.getExercises() != null ?
                routine.getExercises().stream()
                        .map(ex -> ExerciseTrackerDTO.builder()
                                .id(ex.getId())
                                .name(ex.getName())
                                .series(ex.getSeries())
                                .reps(ex.getReps())
                                .weight(ex.getWeight())
                                .isCompleted(ex.getIsCompleted())
                                .build())
                        .toList() : List.of();

        return RoutineDTO.builder()
                .id(routine.getId())
                .name(routine.getName())
                .description(routine.getDescription())
                .isPublic(routine.getIsPublic())
                .createdAt(routine.getCreatedAt())
                .muscles(routine.getMuscles())
                .exercises(exerciseDTOs)
                .creatorName(routine.getUser() != null ? routine.getUser().getUsername() : null)
                .build();
    }

    public static Routine convertToEntity(RoutineDTO dto) {
        if (dto == null) return null;

        Routine routine = Routine.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .isPublic(dto.getIsPublic())
                .muscles(dto.getMuscles())
                .build();

        if (dto.getExercises() != null) {
            List<ExerciseTracker> exercises = dto.getExercises().stream()
                    .map(exDto -> ExerciseTracker.builder()
                            .id(exDto.getId())
                            .name(exDto.getName())
                            .series(exDto.getSeries())
                            .reps(exDto.getReps())
                            .weight(exDto.getWeight())
                            .isCompleted(exDto.getIsCompleted())
                            .routine(routine)
                            .build())
                    .collect(Collectors.toList());
            routine.setExercises(exercises);
        }
        return routine;
    }
}