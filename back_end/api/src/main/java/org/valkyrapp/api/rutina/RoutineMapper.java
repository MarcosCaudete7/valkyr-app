//package org.valkyrapp.api.rutina;
//
//import org.springframework.stereotype.Component;
//import org.valkyrapp.api.rutina.Routine;
//import org.valkyrapp.api.usuario.User;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Set;
//
//@Component
//public class RoutineMapper {
//    private Long id;
//    private String name;
//    private String description;
//    private boolean isPublic;
//    private LocalDateTime createdAt;
//    private Set<Muscles> muscles;
//    private User user;
//
//    public static RoutineDTO convertToDTO(Routine routine) {
//        if (routine == null) return null;
//        return RoutineDTO.builder()
//                .id(routine.getId())
//                .name(routine.getName())
//                .description(routine.getDescription())
//                .isPublic(routine.isPublic())
//                .createdAt(routine.getCreatedAt())
//                .muscles(routine.getMuscles())
//                .user(routine.getUser())
//                .build();
//    }
//    public static Routine convertToEntity(RoutineDTO routineDTO) {
//        if (routineDTO == null) return null;
//        return Routine.builder()
//                .id(routineDTO.getId())
//                .name(routineDTO.getName())
//                .description(routineDTO.getDescription())
//                .isPublic(routineDTO.isPublic())
//                .createdAt(routineDTO.getCreatedAt())
//                .muscles(routineDTO.getMuscles())
//                .user(routineDTO.getUser())
//                .build();
//    }
//}
