package org.valkyrapp.api.ai;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;
import org.valkyrapp.api.routine.Exercise; // Asegúrate de importar tu modelo
import org.valkyrapp.api.routine.ExerciseRepository;


import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class GroqAIServiceImpl implements GroqAIService {

    private final ChatModel chatModel;

    private final ExerciseRepository exerciseRepository;

    public GroqAIServiceImpl(ChatModel chatModel, ExerciseRepository exerciseRepository) {
        this.chatModel = chatModel;
        this.exerciseRepository = exerciseRepository;
    }

    private OpenAiChatOptions getOptions() {
        String modelName = "llama-3.3-70b-versatile";
        return OpenAiChatOptions.builder()
                .model(modelName)
                .temperature(0.5)
                .build();
    }


    private String buildSystemPrompt(String type, String description) {
        List<Exercise> allExercises = exerciseRepository.findAll();
        String exercisesList = allExercises.stream()
                .map(Exercise::getName)
                .collect(Collectors.joining(", "));

        return String.format("""
            Eres un experto en %s. %s.
            
            TU TAREA PRINCIPAL: Generar una rutina JSON válida usando SOLO ejercicios de la lista proporcionada abajo.
            
            LISTA DE EJERCICIOS DISPONIBLES (Usa nombres exactos de aquí):
            [%s]
            
            REGLAS DE FORMATO (Responde SOLO JSON):
            {
              "name": "Nombre Rutina",
              "description": "Breve descripción",
              "exercises": [
                {"name": "Nombre Exacto de la Lista", "series": 4, "reps": 10, "weight": 0.0}
              ]
            }
            
            REGLAS DE ENTRENAMIENTO:
            - Minimo 2 días de descanso por músculo.
            - Ten en cuenta la implicación muscular (sinergias).
            - 2-3 ejercicios por grupo muscular, total 6-9 ejercicios.
            - SI EL USUARIO PIDE UN EJERCICIO QUE NO ESTÁ EN LA LISTA, BUSCA EL MÁS PARECIDO EN LA LISTA.
            
                IMPORTANTE:
                    NO uses Markdown (nada de ```json).
                    NO escribas texto introductorio como "Aquí tienes".
                    Devuelve SOLO el texto JSON crudo.
            """, type, description, exercisesList);
    }

    @Override
    public String getRuntinaPower(String ejercicio) {
        String instruction = buildSystemPrompt("Powerlifting", "Tu objetivo es la fuerza máxima (1RM). Foco en intensidad.");
        return callAi(instruction, ejercicio);
    }

    @Override
    public String getRuntinaBodyBuilding(String ejercicio) {
        String instruction = buildSystemPrompt("Bodybuilding", "Tu objetivo es la hipertrofia. Foco en volumen y aislamiento.");
        return callAi(instruction, ejercicio);
    }

    private String callAi(String systemPrompt, String userExercise) {
        SystemMessage systemMessage = new SystemMessage(systemPrompt);
        UserMessage userMessage = new UserMessage("Genera rutina para: " + userExercise);

        Prompt prompt = new Prompt(List.of(systemMessage, userMessage), getOptions());
        String rawResponse = Objects.requireNonNull(chatModel.call(prompt).getResult()).getOutput().getText();

        return cleanJson(rawResponse);
    }

    private String cleanJson(String text) {
        if (text == null) return "{}";

        String clean = text.replace("```json", "").replace("```", "");
        int firstBrace = clean.indexOf("{");
        int lastBrace = clean.lastIndexOf("}");

        if (firstBrace != -1 && lastBrace != -1) {
            return clean.substring(firstBrace, lastBrace + 1);
        }

        return clean.trim();
    }
}