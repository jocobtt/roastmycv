import { type NextApiRequest, type NextApiResponse } from "next";
import * as z from "zod";
import { pinecone, query } from "../../../utils/pinecone";
import { createEmbedding } from "../../../utils/openai";

const questionSchema = z.object({
  text: z.string().min(2, "Please enter more than 1 character"),
});

const ask = async (req: NextApiRequest, res: NextApiResponse) => {
  // Process question
  try {
    const body = questionSchema.parse(JSON.parse(req.body));
    const { text } = body;

    console.log("hi 1");
    // Embed question text
    // const response = await openai.createEmbedding({
    //     input: text,
    //     model: "text-embedding-ada-002",
    // });
    const response = await createEmbedding(text);

    const { embedding, index } = response.data[0] as {
        embedding: number[],
        index: number
    };

    // Get top 5 most relevant verses
    const similarEmbeddings = await query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    const answers = (similarEmbeddings as {
        matches: {
            metadata: Record<string, unknown>
        }[]
    }).matches.map((match) => {
      return match.metadata;
    });

    res.status(200).json(answers);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: (e as Error).message });
  }
};

export default ask;
