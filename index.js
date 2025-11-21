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

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Scottie201/trained_text_generation",
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

    const text = await response.text();

    // Log everything for debugging
    console.log("HF response status:", response.status);
    console.log("HF response text:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("HF response was not JSON:", text);
      return res.status(500).json({
        recipe:
          "Error: HF router response invalid. Check server logs for details.",
      });
    }

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
















