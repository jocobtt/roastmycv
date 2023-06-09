import { type NextApiRequest, type NextApiResponse } from "next";
import * as z from "zod";
import { pinecone, query, get } from "../../../utils/pinecone";
import { createEmbedding, openai } from "../../../utils/openai";
import { ChatCompletionRequestMessage } from "openai";
import axios from "axios";

const questionSchema = z.object({
  text: z.string().min(2, "Please enter more than 1 character"),
  prevRoasts: z.optional(z.array(z.string())),
});

function isJsonString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

const ask = async (req: NextApiRequest, res: NextApiResponse) => {
  // Process question
  let stage = 0;
  try {
    let body = req.body;
    stage = 1;
    if (isJsonString(body)) {
      body = JSON.parse(req.body);
    }

    const prev =
      body.prevRoasts?.map((roast) => `roast: ${roast}`).join("\n") ?? "";

    stage = 2;
    console.log(prev);
    // Construct the prompt
    const prompt = `
      You are the world's foremost expert on script writing and copywriting. A few years ago a project called pudding.cool went viral online for roasting people's music listening habits.

      Your job is to create a version of this that is suitable for roasting career resumes and CVs.

      Be extremely specific. Tone should be passive aggressive, monotone. 
      
      ONE SENTENCE MAXIMUM. Do NOT mention any human names in your ouptut. DO mention company names.

      This is the resume you are roasting:
      [[RESUME START]] 
      ${body.text}
      [[RESUME END]] 
    
      Sample roasts:
      roast: worked at google? classic...
      roast: you switch jobs more than my mum switch clothes. I guess that's okay nowadays...
      ${prev}
      `;
    // Here are some examples roasts based on the text above. Don't repeat similar jokes:
    // roast: worked at google? classic...
    // roast: you switch jobs more than my mum switch clothes. I guess that's okay nowadays...
    // roast: is "Founder" codename for "unemployed"? I wish you the best I guess...
    // roast: it's almost like you enjoy using the words "delivered", "authored" and "built". Want some resume with your buzzwords?
    // roast: brigham young university? I bet their parties are fun...

    stage = 3;
    console.log("trying");

    const openAIRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "roast: " },
        ],
        temperature: 1.0,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    stage = 11;
    const answer = openAIRes.data.choices[0].message.content;
    stage = 12;

    stage = 13;
    res.status(200).json({ answer: answer });
  } catch (e) {
    console.log(e.message);
    res.status(400).json({
      error: e,
      message: (e as Error).message,
      body: req.body,
      stage: stage,
    });
  }
};

export default ask;
