package org.valkyrapp.api.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.valkyrapp.api.rutina.Routine;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class UserDTO {

    private Long id;

    @NotBlank(message = "El username es obligatorio")
    private String username;

    @Email(message = "El formato del email no es válido")
    @NotBlank(message = "El email es obligatorio")
    private String email;

    @Size(min = 8, message = "La contraseña debe contener al menos 8 caracteres")
    private String password;

    private String fullName;

    private LocalDateTime createdAt;

    private List<Routine> routines;
}