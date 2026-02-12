package org.valkyrapp.api.routine;

import org.valkyrapp.api.routine.Exercise;
import org.valkyrapp.api.routine.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @GetMapping
    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    @GetMapping("/muscle/{group}")
    public List<Exercise> getByMuscle(@PathVariable String group) {
        return exerciseRepository.findByMuscleGroup(group);
    }

    @GetMapping("/search")
    public List<Exercise> search(@RequestParam String name) {
        return exerciseRepository.findByNameContainingIgnoreCase(name);
    }
}
