import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Optional security & caching headers
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !ingredients.trim()) {
    return res.status(400).json({ recipe: "Please provide ingredients." });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/deepseek-r1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Create a detailed, step-by-step recipe using these ingredients: ${ingredients}`,
        }),
      }
    );

    // Read response safely
    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text();
      console.error("HF response was not JSON:", text);
      return res.status(500).json({ recipe: "Error: HF response invalid." });
    }

    console.log("Hugging Face response:", JSON.stringify(data, null, 2));

    // deepseek-r1 returns [{ generated_text: "..." }]
    const recipe =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : "No recipe generated. Check server logs.";

    res.json({ recipe });
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({ recipe: "Error generating recipe. Check server logs." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





