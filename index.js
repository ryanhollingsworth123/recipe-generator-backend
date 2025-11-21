import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.HF_API_KEY,
  baseUrl: "https://router.huggingface.co/v1",
});

app.use(cors());
app.use(express.json());

app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients) return res.status(400).json({ recipe: "Provide ingredients." });

  try {
    const completion = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-R1:novita",
      messages: [
        {
          role: "user",
          content: `Create a detailed recipe using these ingredients: ${ingredients}`,
        },
      ],
    });

    const recipe = completion.choices[0].message.content;
    res.json({ recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ recipe: "Error generating recipe." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));










