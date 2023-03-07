import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

const MODEL = "text-embedding-ada-002";

// export const queryLLM = async (text: string) => {
//   const res = openai.createChatCompletion({
    
//     model: "gpt-3.5-turbo",
//     temperature: 0.9,
//     max_tokens = 150,
//     top_p = 1,
//     frequency_penalty = 0.0,
//     presence_penalty = 0.6,
//     stop = [" Human:", " AI:"],
//   });
//   return res.choices[0].text.trim();
// };

export async function createEmbedding(text: string) {
  const embedding = await openai.createEmbedding({
    model: MODEL,
    input: text,
  });

  return embedding.data;
}
