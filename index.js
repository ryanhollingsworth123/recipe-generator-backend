import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const client = new HfInference({ apiKey: process.env.HF_API_KEY });

app.use(cors());
app.use(express.json());

app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients) {
    return res.status(400).json({ recipe: "Please provide ingredients." });
  }

  try {
    const prompt = `Create a detailed recipe using these ingredients: ${ingredients}`;

    const result = await client.textGeneration({
      model: "tiiuae/falcon-7b-instruct",
      inputs: prompt,
      parameters: { max_new_tokens: 250 },
    });

    const recipe = Array.isArray(result) && result[0]?.generated_text
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










