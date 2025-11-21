import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients) {
    return res.status(400).json({ recipe: "Please provide ingredients." });
  }

  try {
    const prompt = `Create a detailed recipe using these ingredients: ${ingredients}`;

    // Call the Hugging Face Router API for DeepSeek-R1 (conversational)
    const response = await fetch(
      "https://router.huggingface.co/api/models/deepseek-ai/DeepSeek-R1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true },
        }),
      }
    );

    // Read and parse response
    const data = await response.json();

    // DeepSeek-R1 returns an array of objects with 'generated_text'
    const recipe =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
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













