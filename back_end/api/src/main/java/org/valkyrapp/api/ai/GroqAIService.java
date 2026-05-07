package org.valkyrapp.api.ai;

public interface GroqAIService {

    public String getRuntinaPower(String ejercicio);

    public String getRuntinaBodyBuilding(String ejercicio);
    public String analyzeFood(String base64Image);
    public String analyzePantry(String ingredients);
    public String analyzeShoppingList(String base64Image);
}
