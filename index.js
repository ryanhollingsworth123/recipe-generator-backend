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
    const response = await fetch(
      "https://router.huggingface.co/api/models/deepseek-r1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Create a detailed recipe using these ingredients: ${ingredients}`,
          options: { wait_for_model: true },
        }),
      }
    );
    
    // Read body only once
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("HF response was not JSON:", text);
      return res.status(500).json({ recipe: "Error: HF router response invalid." });
    }
    
    console.log("HF response:", JSON.stringify(data, null, 2));
    
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








