import { type NextApiRequest, type NextApiResponse } from "next";
import * as z from "zod";
import { pinecone, query, get } from "../../../utils/pinecone";
import { createEmbedding, openai } from "../../../utils/openai";
import { ChatCompletionRequestMessage } from "openai";
import axios from "axios";

const questionSchema = z.object({
  text: z.string().min(2, "Please enter more than 1 character"),
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

    stage = 2;
    const parsed = questionSchema.parse(body);
    stage = 3;
    const { text } = parsed;

    // Embed question text
    stage = 4;
    console.log({ text });
    const response = await createEmbedding(text);
    stage = 5;

    stage = 6;
    const { embedding, index } = response.data[0] as {
      embedding: number[];
      index: number;
    };

    // Get top 5 most relevant verses
    stage = 7;
    const similarEmbeddings = await query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
      filter: {
        source: "General Handbook",
      },
    });

    stage = 8;
    const answers = (
      similarEmbeddings as {
        matches: {
          metadata: Record<string, unknown>;
        }[];
      }
    ).matches.map((match) => {
      return match.metadata;
    });

    stage = 9;
    // Construct the prompt
    const prompt = `
      You are the foremost expert on the rules and guidelines of The Church of Jesus Christ of Latter-day Saints. Primarily as it relates to the General Handbook. You are also a member of this church and believe in the church's teachings.
      You will provide answers swiftly, succintly and with conviction. You will answer with a casual, kind and respectful tone. Swearing is completely off limits. 
      Please keep your answers to five sentences maximum, and speak in complete sentences. Stop speaking once your point is made.
      
      Context that may be useful, pulled from the General Handbook.
      
      ${answers
        .map((answer) => {
          const { book_title, chapter_number, verse_number } = answer;
          return `${book_title} ${chapter_number}:${verse_number}`;
        })
        .join("\n\n")}
    `;

    // const questions: ChatCompletionRequestMessage[] = [
    //   { role: "user", content: "Who is Captain Moroni?" },
    //   {
    //     role: "assistant",
    //     content:
    //       "A military commander of the Nephite army. He was a righteous and skilled military commander. He is known \
    //       for creating the Title of Libery, a standard that he raised to rally the Nephites to defend their liberties from a group of dissenters who wanted to establish their leader as a king.",
    //   },
    //   { role: "user", content: "Who are Nephi's older siblings?" },
    //   { role: "assistant", content: "Laman, Lemuel, and Sam." },
    //   {
    //     role: "user",
    //     content: "When did Jesus Christ visit the people of Nephi?",
    //   },
    //   {
    //     role: "assistant",
    //     content:
    //       "Jesus Christ visited the people in the Americas in 34 CE. While there he blessed them and taught them the gospel. He also performed miracles and healed their sick.",
    //   },
    //   { role: "user", content: "What is baptism?" },
    //   {
    //     role: "assistant",
    //     content:
    //       "Baptism is an essential ordinance that involves immersion in water. It symbolizes a spiritual rebirth and clensing of sins. Baptism is a covenant or promise between the individual being baptized and God. \n\n Baptism invovles sacred promises to follow Jesus Christ.",
    //   },
    //   {
    //     role: "user",
    //     content: "How can I know that the Book of Mormon is true",
    //   },
    //   {
    //     role: "assistant",
    //     content:
    //       "The Book of Mormon can be known to be true through prayer and personal revelation from God. You can read it, ponder it's message and pray to God to ask if it is true.",
    //   },
    //   { role: "user", content: "What is the origin of the Book of Mormon?" },
    //   {
    //     role: "assistant",
    //     content:
    //       "The Book of Mormon was originally written by ancient prophets who lived in the Americas between 2200 BC and 421 AD. The prophets kept records on metal plates, which were eventually compiled by a prophet named Mormon into a single volume. \
    //     ",
    //   },
    //   { role: "user", content: "Who is Jesus Christ?" },
    //   {
    //     role: "assistant",
    //     content:
    //       "Jesus Christ is the Son of God. He is our the central figure in Christianity and is the center of the Church of Jesus Christ of Latter Day Saint religion. The Book of Mormon is another testament of Him along with the Bible.",
    //   },
    //   {
    //     role: "user",
    //     content: "What can the Book of Mormon do for me in my life?",
    //   },
    //   {
    //     role: "assistant",
    //     content:
    //       "The Book of Mormon can help you to gain a greater understanding of the teachings and ministry of Jesus Christ, and how they apply to your life today. It can also deepen your appreciation for the role of prophets and the importance of receiving ongoing revelation from God. Ultimately, the Book of Mormon can help you to draw closer to God and to develop a deeper sense of peace, purpose, and joy in your life.",
    //   },
    //   {
    //     role: "user",
    //     content: "Give me a 10 word summary of the Book of Mormon?",
    //   },
    //   {
    //     role: "assistant",
    //     content:
    //       "Sacred text of Latter-day Saints about ancient Americas and Jesus Christ.",
    //   },
    // ];

    stage = 10;
    console.log("trying");

    const openAIRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: prompt },
          //   ...questions,
          // { role: "user", content: "Who is Captain Moroni?" },
          // {
          //   role: '',
          //   content:
          //     `A military commander of the Nephite army. He was a righteous and skilled military commander. He is known for creating the Title of Libery, a standard that he raised to rally the Nephites to defend their liberties from a group of dissenters who wanted to establish their leader as a king.`,
          // },
          { role: "user", content: body.text },
        ],
        temperature: 0.9,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.6,
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
    res.status(200).json({ answer: answer, relevantResources: answers });
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
