import { type NextApiRequest, type NextApiResponse } from "next";
import * as z from "zod";
import { pinecone, query } from "../../../utils/pinecone";
import { createEmbedding } from "../../../utils/openai";

const questionSchema = z.object({
  text: z.string().min(2, "Please enter more than 1 character"),
});

// export const config = {
//     api: {
//         bodyParser: false
//     }
// }

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
  let stage = 0
  let error = undefined 
  try {
    let body = req.body;
    stage = 1
    if (isJsonString(body)) {
      body = JSON.parse(req.body);
    }

    stage = 2
    const parsed = questionSchema.parse(body);
    stage = 3
    const { text } = parsed;
    
    // Embed question text
    // const response = await openai.createEmbedding({
      //     input: text,
      //     model: "text-embedding-ada-002",
      // });
    stage = 4
    const response = await createEmbedding(text);
    stage = 5
    
    stage = 6
    const { embedding, index } = response.data[0] as {
      embedding: number[];
      index: number;
    };

    // Get top 5 most relevant verses
    stage = 7
    const similarEmbeddings = await query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });
    
    stage = 8
    const answers = (
      similarEmbeddings as {
        matches: {
          metadata: Record<string, unknown>;
        }[];
      }
      ).matches.map((match) => {
        return match.metadata;
      });
      
    stage = 9
    res.status(200).json(answers);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e, message: (e as Error).message, body: req.body, stage: stage, thing: error });
  }
};

export default ask;
