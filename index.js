import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Create a recipe using the following ingredients: ${ingredients}. 
                     Format it with a title, ingredients list, and step-by-step instructions.`
        }
      ]
    });

    const recipe = completion.choices[0].message.content;

    res.json({ recipe });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ recipe: "Error generating recipe" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

















