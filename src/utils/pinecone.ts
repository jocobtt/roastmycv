import { PineconeClient } from "pinecone-client";
import axios from "axios";

export type Metadata = Partial<{
  book_id: number;
  chapter_id: number;
  verse_id: number;
  volume_title: string;
  book_title: string;
  volume_long_title: string;
  book_long_title: string;
  volume_subtitle: string;
  book_subtitle: string;
  volume_short_title: string;
  book_short_title: string;
  volume_lds_url: string;
  book_lds_url: string;
  chapter_number: number;
  verse_number: number;
  scripture_text: string;
  verse_title: string;
  verse_short_title: string;
}>;

console.log({
  apiKey: process.env.PINECONE_API_KEY,
  baseUrl: process.env.PINECONE_BASE_URL,
});

export const pinecone = new PineconeClient<Metadata>({
  apiKey: process.env.PINECONE_API_KEY,
  baseUrl: process.env.PINECONE_BASE_URL,
});

const URL = `https://${process.env.PINECONE_BASE_URL}/query`;

// export const query = async ({
//   vector,
//   topK,
//   includeMetadata,
// }: {
//   vector: number[];
//   topK: number;
//   includeMetadata: boolean;
// }) => {
//   const res = await pinecone.query({
//     vector: vector,
//     includeMetadata: true,
//     topK: 5,
//   })
//   return res
// }

export const query = async ({
  vector,
  topK,
  includeMetadata,
}: {
  vector: number[];
  topK: number;
  includeMetadata: boolean;
}) => {
  // const results = await fetch(URL, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Api-Key": process.env.PINECONE_API_KEY || "",
  //   },
  //   body: JSON.stringify({
  //     vector,
  //     topK,
  //     includeMetadata,
  //     includeValues: true,
  //     namespace: "",
  //   }),
  // })

  const results = await axios.post(
    URL,
    {
      vector,
      topK,
      includeMetadata,
      includeValues: true,
      namespace: "",
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.PINECONE_API_KEY || "",
      },
    }
  );

  return results.data;
};
