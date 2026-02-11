package org.valkyrapp.api.ai;

import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Objects;


@Service
public class GroqAIServiceImpl implements GroqAIService {
    private final ChatModel chatModel;
    private final String modelName = "llama-3.3-70b-versatile";

    public GroqAIServiceImpl(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    private OpenAiChatOptions getOptions() {
        return OpenAiChatOptions.builder()
                .model(modelName)
                .temperature(0.5)
                .build();
    }


    @Override
    public String getRuntinaPower(String ejercicio) {
        String systemInstruction = """
            Eres un experto en Powerlifting. Tu objetivo es la fuerza máxima (1RM).
            Genera una rutina basada en el ejercicio proporcionado.
            Responde EXCLUSIVAMENTE en formato JSON plano con esta estructura:
            {
              "name": "Nombre Power",
              "description": "Foco en intensidad y técnica",
              "exercises": [
                {"name": "nombre", "series": 4, "reps": 3, "weight": 0.0}
              ]
            }
            
            Recuerda que este es el formato, basate en entrenamientos publicos para guiarte.
            Tienes que tener en cuenta que el musculo que se ejercite necesita MINIMO dos dias de descanso.
            Tienes que tener en cuenta la implicación muscular. Esto es que si un musculo realiza otros musculos,
            los otros musculos deberian de formar parte de la rutina (Ejemplo: Press banca tiene la implicacion del
            hombro y del triceps)
            Tambien separar y aislar bien los musculos que se realizan en la rutina
            Recuerda hacer como mucho 2-3 ejercicios por grupo muscular y hacer en total unos 6-9 ejercicios por rutina
            Los nombres de los ejercicios tienen que ser reales, basate en ejercicios buenos y existentes
            """;
        return callAi(systemInstruction, ejercicio);
    }

    @Override
    public String getRuntinaBodyBuilding(String ejercicio) {
        String systemInstruction = """
            Eres un experto en Bodybuilding e Hipertrofia. Tu objetivo es el crecimiento muscular.
            Responde EXCLUSIVAMENTE en formato JSON plano con esta estructura:
            {
              "name": "Nombre Bodybuilding",
              "description": "Foco en tiempo bajo tensión y volumen",
              "exercises": [
                {"name": "nombre", "series": 4, "reps": 12, "weight": 0.0}
              ]
            }
            
            Recuerda que este es el formato, basate en entrenamientos publicos para guiarte.
            Tienes que tener en cuenta que el musculo que se ejercite necesita MINIMO dos dias de descanso.
            Tienes que tener en cuenta la implicación muscular. Esto es que si un musculo realiza otros musculos,
            los otros musculos deberian de formar parte de la rutina (Ejemplo: Press banca tiene la implicacion del
            hombro y del triceps)
            Tambien separar y aislar bien los musculos que se realizan en la rutina
            Recuerda hacer como mucho 2-3 ejercicios por grupo muscular y hacer en total unos 6-9 ejercicios por rutina
            Los nombres de los ejercicios tienen que ser reales, basate en ejercicios buenos y existentes
            """;
        return callAi(systemInstruction, ejercicio);
    }

    private String callAi(String systemPrompt, String userExercise) {
        SystemMessage systemMessage = new SystemMessage(systemPrompt);
        UserMessage userMessage = new UserMessage("Genera rutina para: " + userExercise);

        Prompt prompt = new Prompt(List.of(systemMessage, userMessage), getOptions());
        return Objects.requireNonNull(chatModel.call(prompt).getResult()).getOutput().getText();
    }
}