import fs, { createReadStream } from "fs";
import { type NextApiRequest, type NextApiResponse } from "next";

import axios from "axios";
import formidable from "formidable-serverless";
import * as pdfjs from "pdfjs-dist";
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";
import streamToBuffer from "stream-to-buffer";

// Auth token generate
// async function getToken() {
//   const auth = new GoogleAuth({
//     keyFileName: process.env.keyfilePath,
//     scopes: ['https://www.googleapis.com/auth/cloud-platform'],
//   });
//   const client = await auth.getClient();
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
      Authorization: "Bearer ${accessToken}",
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

const credential = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_KEY, "base64").toString("utf-8")
);

console.log(credential);

const storage = new Storage({
  projectId: "seventh-history-374820",
  credentials: {
    client_email: credential.client_email,
    private_key: credential.private_key,
  },
});

const uploadToGCS = async (path): Promise<string> => {
  // Set the name of the PDF file to be uploaded and the destination bucket in GCS
  const bucketName = "roastytoasty";
  const pdfFilename = `${randomUUID()}.pdf`;

  // Upload the PDF file to GCS
  const bucket = storage.bucket(bucketName);
  const fileToUpload = bucket.file(pdfFilename);
  const url = await fileToUpload.getSignedUrl({
    action: "read",
    expires: "03-09-2024",
  });

  const createWriteStream = (filename: string, contentType?: string) => {
    const ref = bucket.file(filename);

    const stream = ref.createWriteStream({
      gzip: true,
      contentType: contentType,
    });

    return stream;
  };

  // console.log({ file });

  // await new Promise((res, rej) => {
  //   fileToUpload
  //     .createWriteStream()
  //     .on("error", (err) => rej(err))
  //     .on("finish", () => {
  //       console.log(`File ${pdfFilename} uploaded successfully.`);
  //       res("");
  //     })
  //     .end(file);
  // });

  await new Promise((res, rej) => {
    createReadStream(path)
      .pipe(createWriteStream(pdfFilename, "application/pdf"))
      .on("error", (err) => rej(err))
      .on("finish", () => {
        res("");
      });
  });

  return url[0];
};

const extractTextFromPDF = async (file) => {
  // Upload to GCS
  // console.log("file => buffer");
  // const pdfBuffer = await new Promise((resolve, reject) => {
  //   streamToBuffer(file, (err, buffer) => {
  //     if (err) reject(err);
  //     resolve(buffer);
  //   });
  // });
  console.log("sending to GCS");
  const url = await uploadToGCS(file.path);
  console.log({ url });

  const doc = await pdfjs.getDocument(url).promise;
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
    form.keepExtensions = true;
    stage = 2;
    const { files } = await new Promise<{
      err: Error;
      fields: formidable.Fields;
      files: formidable.Files;
    }>((res, rej) => {
      form.parse(req, (err, fields, files) => {
        console.log({ err, fields, files });
        if (err) {
          rej({ err, fields, files });
        }
        res({ fields, files, err: undefined });
      });
    });

    stage = 3;
    const text = await extractTextFromPDF(files.resume);
    console.log({ text });
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
