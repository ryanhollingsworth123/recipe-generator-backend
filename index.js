import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
    const response = await fetch("https://router.huggingface.co/models/google/flan-t5-small", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Create a detailed, step-by-step recipe using these ingredients: ${ingredients}`,
        options: { wait_for_model: true }
      }),
    });
    
    // Clone response for logging
    const responseClone = response.clone();
    
    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await responseClone.text(); // read the clone, original untouched
      console.error("Response was not JSON:", text);
      return res.status(500).json({ recipe: "Error: HF router response invalid" });
    }
    
    console.log("HF response:", JSON.stringify(data, null, 2));
    
    const recipe = Array.isArray(data) && data[0]?.generated_text
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




