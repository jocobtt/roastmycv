import { type NextApiRequest, type NextApiResponse } from "next";

import axios from "axios";
import formidable from "formidable-serverless";
import * as pdfjs from "pdfjs-dist";

// Auth token generate
// async function getToken() {
//   const auth = new GoogleAuth({
//     scopes: SCOPES,
//   });
//   const accessToken = await auth.getAccessToken();
//   return accessToken.token;
// }

// OCR
const getOCRText = async (file) => {
  const encoded_string = Buffer.from(file).toString("base64");
  const data = {
    skipHumanReview: true,
    rawDocument: { content: encoded_string, mimeType: "application/pdf" },
  };

  const config = {
    maxBodyLength: Infinity,
    headers: {
      Authorization: "Bearer " + process.env.GOOGLE_AUTH_TOKEN,
      "Content-Type": "text/plain",
    },
    data: data,
  };

  const response = await axios.post<{ document: { text: string } }>(
    "https://us-documentai.googleapis.com/v1/projects/56110867233/locations/us/processors/b380815aaa4f9e0a:process",
    config
  );
  const text = response.data.document.text;
  return text;
};

const extractTextFromPDF = async (path) => {
  const doc = await pdfjs.getDocument(path).promise;
  const page1 = await doc.getPage(1);
  const content = await page1.getTextContent();
  const strings = content.items
    .map(function (item) {
      // eslint-disable-next-line
      return (item as { str: string }).str;
    })
    .join("");
  return strings;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const toText = async (req: NextApiRequest, res: NextApiResponse) => {
  let stage = 0;
  try {
    stage = 1;
    const form = new formidable.IncomingForm();
    form.uploadDir = "./";
    form.keepExtensions = true;
    stage = 2;
    const { err, fields, files } = await new Promise((res, rej) => {
      form.parse(req, (err, fields, files) => {
        console.log({ err, fields, files });
        if (err) {
          rej({ err, fields, files });
        }
        res({ fields, files, err: undefined });
      });
    });

    stage = 3;
    console.log("path", files.resume.path);
    const text = await extractTextFromPDF(files.resume.path);
    stage = 4;
    res.status(200).json({ text: text });
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

export default toText;
