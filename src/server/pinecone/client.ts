import { PineconeClient } from "pinecone-client";

import { env } from "../../env/server.mjs";

export const pinecone = new PineconeClient({
  apiKey: env.PINECONE_API_KEY,
  baseUrl: env.PINECONE_BASE_URL,
  namespace: "",
});
