package org.valkyrapp.api.usuario;

import org.springframework.stereotype.Component;
import org.valkyrapp.api.routine.Routine;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class UserMapper {
    private Long id;
    private String username;
    private String email;
    private String password;
    private String fullName;
    private LocalDateTime createdAt;
    private List<Routine> routines;

    public static UserDTO convertToDTO(User user){
        if(user == null) return null;
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .password(null)
                .fullName(user.getFullName())
                .createdAt(user.getCreatedAt())
                .routines(user.getRoutines())
                .build();
    }

    public static User convertToEntity(UserDTO userdto){
        if(userdto == null) return null;
        return User.builder()
                .id(userdto.getId())
                .username(userdto.getUsername())
                .email(userdto.getEmail())
                .password(userdto.getPassword())
                .fullName(userdto.getFullName())
//                .routines(userdto.getRoutines())
                .build();
    }
}
