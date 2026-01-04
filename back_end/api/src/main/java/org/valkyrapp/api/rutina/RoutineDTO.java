package org.valkyrapp.api.rutina;
import lombok.*;
import org.valkyrapp.api.rutina.Routine;
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

    private boolean isPublic;

    private LocalDateTime createdAt;

    private Set<Muscles> muscles;

    private User user;

}
