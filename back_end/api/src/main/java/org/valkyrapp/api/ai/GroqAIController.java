package org.valkyrapp.api.ai;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1")
public class GroqAIController {
    private GroqAIService groqAIService;

    public GroqAIController(GroqAIService groqAIService) {
        this.groqAIService = groqAIService;
    }

    @GetMapping("/getRutinaPower")
    public String getRutinaPower(@RequestParam String ejercicio) {
        return groqAIService.getRuntinaPower(ejercicio);
    }
    @GetMapping("/getRutinaBodyBuilding")
    public String getRutinaBodyBuilding(@RequestParam String ejercicio) {
    return groqAIService.getRuntinaBodyBuilding(ejercicio);
    }
}
