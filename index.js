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

    // Call via router + provider
    const response = await fetch(
      "https://router.huggingface.co/featherless-ai/v1/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Scottie201/trained_text_generation:featherless-ai",
          inputs: prompt,
          parameters: { max_new_tokens: 200 },
        }),
      }
    );

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Featherless response was not JSON:", text);
      return res.status(500).json({ recipe: "Error: invalid response from provider." });
    }

    const recipe =
      data?.choices?.[0]?.text || data?.generated_text || "No recipe generated.";

    res.json({ recipe });
  } catch (err) {
    console.error("Error generating recipe:", err);
    res.status(500).json({ recipe: "Error generating recipe." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});















