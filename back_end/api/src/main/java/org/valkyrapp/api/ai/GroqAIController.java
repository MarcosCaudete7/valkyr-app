package org.valkyrapp.api.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

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

    @PostMapping("/analyze/food")
    public ResponseEntity<String> analyzeFood(@RequestBody Map<String, String> payload) {
        try {
            String base64Image = payload.get("image");
            if (base64Image == null || base64Image.isEmpty()) {
                return ResponseEntity.badRequest().body("No image provided");
            }
            return ResponseEntity.ok(groqAIService.analyzeFood(base64Image));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al analizar comida: " + e.getMessage());
        }
    }
}
