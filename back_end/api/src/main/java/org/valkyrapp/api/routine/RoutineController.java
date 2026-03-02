package org.valkyrapp.api.routine;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/routines")
@RequiredArgsConstructor
public class RoutineController {
    private final RoutineService routineService;

    @PatchMapping("/exercises/{id}/status")
    public ResponseEntity<Void> updateExerciseStatus(
            @PathVariable Long id,
            @RequestParam boolean completed) {

        routineService.updateExerciseStatus(id, completed);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<RoutineDTO> create(@RequestBody RoutineDTO routineDTO) {
        String username = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        RoutineDTO savedRoutine = routineService.saveRoutine(routineDTO, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoutine);
    }

    @GetMapping("/myroutines")
    public ResponseEntity<List<RoutineDTO>> getMyRoutines() {
        String username = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        List<RoutineDTO> routines = routineService.listAllRoutines(username);
        return ResponseEntity.ok(routines);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoutineDTO> getRoutineById(@PathVariable Long id) {
        return ResponseEntity.ok(routineService.getRoutineById(id));
    }

    @GetMapping("/user/{userId}/public")
    public ResponseEntity<List<RoutineDTO>> getPublicRoutines(@PathVariable Long userId) {
        return ResponseEntity.ok(routineService.listPublicRoutinesByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoutineDTO> updateRoutine(
            @PathVariable Long id,
            @RequestBody RoutineDTO routineDTO) {

        String username = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        RoutineDTO updatedRoutine = routineService.updateRoutine(id, routineDTO, username);
        return ResponseEntity.ok(updatedRoutine);
    }
}
