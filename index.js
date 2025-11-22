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
  console.log("Received ingredients:", ingredients); // debug

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: `Create a recipe using these ingredients: ${ingredients}` }
      ],
    });

    const recipe = completion.choices[0].message.content;
    console.log("OpenAI response:", recipe); // debug
    res.json({ recipe });
  } catch (error) {
    console.error("OpenAI Error:", error); // <--- log the real error
    res.status(500).json({ recipe: "Error generating recipe" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


















