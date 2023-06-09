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

const API_KEY = process.env.PINECONE_API_KEY;
const BASE_URL = process.env.PINECONE_BASE_URL;

export const pinecone = new PineconeClient<Metadata>({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
});

const URL = `https://${BASE_URL}/query`;

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

export const get = () => {
  return { key: API_KEY, baseURL: BASE_URL };
};

export const query = async ({
  vector,
  topK,
  includeMetadata,
  filter = undefined,
}: {
  vector: number[];
  topK: number;
  includeMetadata: boolean;
  filter?: Record<string, unknown>;
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
      includeValues: false,
      namespace: "",
      filter: filter,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Api-Key": API_KEY,
      },
    }
  );

  return results.data;
};
