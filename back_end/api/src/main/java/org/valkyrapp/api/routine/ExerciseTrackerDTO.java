package org.valkyrapp.api.routine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseTrackerDTO {
    private Long id;
    private String name;
    private Integer series;
    private Integer reps;
    private Double weight;
    private boolean isCompleted;
}
