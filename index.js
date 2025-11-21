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

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/Shulgin123/tensorblock/dut-recipe-generator-GGUF", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Create a recipe using these ingredients: ${ingredients}`,
      }),
    });

    const data = await response.json();
    const recipe = data[0]?.generated_text || "No recipe generated.";
    res.json({ recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ recipe: "Error generating recipe" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
