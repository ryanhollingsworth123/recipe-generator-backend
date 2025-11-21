import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create Hugging Face Inference client
const client = new InferenceClient({ apiKey: process.env.HF_API_KEY });

app.use(cors());
app.use(express.json());

app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients) {
    return res.status(400).json({ recipe: "Please provide ingredients." });
  }

  try {
    const prompt = `Create a detailed recipe using these ingredients: ${ingredients}`;

    // Use chat API instead of textGeneration for DeepSeek-R1
    const result = await client.chat({
      model: "deepseek-ai/DeepSeek-R1",
      messages: [
        { role: "user", content: prompt }
      ],
      options: { wait_for_model: true },
    });

    // Extract the recipe from response
    const recipe =
      Array.isArray(result?.choices) && result.choices[0]?.message?.content
        ? result.choices[0].message.content
        : "No recipe generated. Check server logs.";

    res.json({ recipe });
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({ recipe: "Error generating recipe." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});












