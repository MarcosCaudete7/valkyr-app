package org.valkyrapp.api.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1")
@RequiredArgsConstructor
public class GroqAIController {
    private final GroqAIService groqAIService;

    @GetMapping("/routine/power")
    public ResponseEntity<String> getRoutinePower(@RequestParam String ejercicio) {
        try {
            return ResponseEntity.ok(groqAIService.getRuntinaPower(ejercicio));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al generar rutina: " + e.getMessage());
        }
    }

    @GetMapping("/routine/bodybuilding")
    public ResponseEntity<String> getRoutineBodyBuilding(@RequestParam String ejercicio) {
        try {
            return ResponseEntity.ok(groqAIService.getRuntinaBodyBuilding(ejercicio));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al generar rutina: " + e.getMessage());
        }
    }
}
