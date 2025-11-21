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

    // Use DeepSeek-R1 model
    const result = await client.textGeneration({
      model: "deepseek-ai/DeepSeek-R1",
      inputs: prompt,
      options: { wait_for_model: true }, // ensure model is ready
      parameters: { max_new_tokens: 250 },
    });

    // The Hugging Face client returns an array
    const recipe =
      Array.isArray(result) && result[0]?.generated_text
        ? result[0].generated_text
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











