package org.valkyrapp.api.routine;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.valkyrapp.api.usuario.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class RoutineDTO {

    private Long id;

    private String name;

    private String description;

    private Boolean isPublic;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    private Set<Muscles> muscles;

    private List<ExerciseTrackerDTO> exercises;

    private String creatorName;

}
