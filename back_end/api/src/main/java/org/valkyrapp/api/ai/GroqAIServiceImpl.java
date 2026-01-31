package org.valkyrapp.api.ai;

import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

public class GroqAIServiceImpl implements GroqAIService {
    private final ChatModel chatModel;

    public GroqAIServiceImpl(ChatModel chatModel) {
        this.chatModel = chatModel;
    }
    private final String modelName = "llama-3.3-70b-versatile";
    private final String maxTokens = "32768";

    private OpenAiChatOptions getOptions() {
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model(modelName)
                .temperature(0.4)
                .maxTokens(Integer.parseInt(maxTokens))
                .build();
        return options;
    }

    private String generateResponse(Prompt prompt) {
        ChatResponse response = chatModel.call(prompt);
        return response.getResult().getOutput().getText();
    }

    @Override
    public String getRuntinaPower(String ejercicio) {
        return generateResponse(getPromptRutinaPower(ejercicio));
    }

    @Override
    public String getRuntinaBodyBuilding(String ejercicio) {
        return generateResponse(getPromptRuntinaBodyBuilding(ejercicio));
    }

    private Prompt getPromptRutinaPower(String ejercicio) {
        PromptTemplate promptTemplate = new PromptTemplate(
                """
                        
                        """
        );
        Message message = promptTemplate.createMessage(
                Map.of("ejercicio", ejercicio)
        );
        OpenAiChatOptions options = getOptions();
        return  new Prompt(List.of(message), options);
    }
    private Prompt getPromptRuntinaBodyBuilding(String ejercicio) {
        PromptTemplate promptTemplate = new PromptTemplate(
                """
                        
                        """
        );
        Message message = promptTemplate.createMessage(
                Map.of("ejercicio", ejercicio)
        );
        OpenAiChatOptions options = getOptions();
        return  new Prompt(List.of(message), options);
    }
}
