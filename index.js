import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

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

    // Replace this with your chosen model URL
    const modelUrl = "https://huggingface.co/Scottie201/trained_text_generation?inference_provider=featherless-ai";

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } }),
    });

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.warn("HF response was not JSON:", text);
      return res.status(500).json({ recipe: "HF returned non-JSON response. Check server logs." });
    }

    console.log("Raw HF response:", JSON.stringify(result, null, 2));

    // Safely extract text from common HF response formats
    const recipe =
      result.generated_text ||
      result[0]?.generated_text ||
      result[0]?.text ||
      result.choices?.[0]?.text ||
      "No recipe generated. Check server logs.";

    res.json({ recipe });
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({ recipe: "Error generating recipe." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});















