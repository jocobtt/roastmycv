import { Configuration, OpenAIApi } from "openai";
import { env } from "../../env/server.mjs";

declare global {
  // eslint-disable-next-line no-var
  var openai: OpenAIApi | undefined;
}

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);
