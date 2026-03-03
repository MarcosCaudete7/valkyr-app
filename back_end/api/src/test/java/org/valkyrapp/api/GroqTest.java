package org.valkyrapp.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.valkyrapp.api.ai.GroqAIService;

@SpringBootTest
class GroqTest {

    @Autowired
    private GroqAIService groqAIService;

    @Test
    void testGroq() {
        try {
            String result = groqAIService.getRuntinaPower("pecho");
            System.out.println("RESULTADO OBTENIDO: " + result);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
