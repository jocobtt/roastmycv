import React, { useEffect } from "react";
import axios from "axios";

import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { RingLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { NextPage } from "next";
import { Metal_Mania, IBM_Plex_Mono } from "@next/font/google";
import Typewriter from "typewriter-effect";

const monoton = Metal_Mania({
  weight: "400",
  subsets: ["latin"],
});

const ibm = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
});

const script = [
  "loading your career history...",
  "enthusiastically analyzing your work experience...",
  "geez.",
  "this is a lot.",
  "[[ROAST1]]",
  "[[ROAST2]]",
  "we're off to a great start.",
  `this is my favorite thing to read on a ${new Date().toLocaleString("en-us", {
    weekday: "long",
  })}.`,
  "[[ROAST3]]",
  "are you sure you didn't just copy-paste this resume from a LinkedIn template?",
  "[[ROAST4]]",
  "that's it. i'm done.",
  "i guess the important thing is that you believe in yourself...",
  "bye. i can't wait to do this again",
  "END"
];

const useRoasts = ({
  resume,
  enabled,
}: {
  resume: string;
  enabled: boolean;
}) => {
  const [roasts, setRoasts] = React.useState([]);

  const fetch = React.useCallback(async () => {
    const res = await axios.post("/api/calls/roast", {
      text: resume,
      prevRoasts: roasts.length > 0 ? roasts : undefined,
    });
    return res.data;
  }, [resume, roasts]);

  const options = (enabled: boolean, onSuccess: (data) => void) => {
    return {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: enabled,
      onSuccess: onSuccess,
    };
  };

  const result1 = useQuery(
    ["question", 1],
    fetch,
    options(enabled, (data) => {
      setRoasts((prev) => [...prev, data.answer]);
    })
  );
  const result2 = useQuery(
    ["question", 2],
    fetch,
    options(!!result1.data, (data) => {
      setRoasts((prev) => [...prev, data.answer]);
    })
  );
  const result3 = useQuery(
    ["question", 3],
    fetch,
    options(!!result2.data, (data) => {
      setRoasts((prev) => [...prev, data.answer]);
    })
  );
  const result4 = useQuery(
    ["question", 4],
    fetch,
    options(!!result3.data, (data) => {
      setRoasts((prev) => [...prev, data.answer]);
    })
  );

  return { status: result4.status, roasts };
};

const Handbook: NextPage = () => {
  const [question, setQuestion] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const searchRef = React.useRef<HTMLTextAreaElement>();
  const [start, setStart] = React.useState(false);
  const [file, setFile] = React.useState(undefined);
  const [dragOver, setDragOver] = React.useState(false);
  const [text, setText] = React.useState(undefined);
  const { status: roastsStatus, roasts } = useRoasts({
    resume: text,
    enabled: !!text,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");
    setStart(true);

    // Send Form data
    const formData = new FormData();
    formData.append("resume", file);
    fetch("/api/roast/to-text", {
      method: "POST",
      body: formData,
      headers: {
        encoding: "multipart/form-data",
      },
    })
      .then((res) => res.json())
      .then((json) => {
        setText(json.text);
        setStatus("success");
      })
      .catch((err) => window.alert("There was an error processing the pdf."));
  };

  React.useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  const handleUpload = (file) => {
    setFile(file);
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a PDF, JPEG or PNG file.");
      return;
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleUpload(file);
  };

  return (
    <>
      <Head>
        <title>Roast My Resume</title>
        <meta name="description" content="Talk to the scriptures." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-black pt-4  pb-32">
        <nav className="flex justify-center">
          <div className="item-center flex flex-col justify-start">
            <p
              className={`5x-10 max-w-sm text-center text-4xl text-white ${monoton.className}`}
            >
              roast my resume
            </p>
          </div>
        </nav>
        <section className="mt-3 flex w-screen flex-col items-center">
          <section className="flex w-96 flex-col px-3">
            <form onSubmit={handleSubmit} className="mb-4">
              {/* <textarea
                ref={searchRef}
                onKeyDown={handleKeyDown}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="resume goes here. don't worry about formatting it."
                className="border-1 flex h-48 w-full  resize-none scroll-m-0 flex-col rounded-md border-white bg-black p-2 text-xl text-white"
              />
              <div
                className="h-48 w-48 rounded-md border-2 border-white p-3"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <p className="text-white">Drag and drop files here</p>
                <input
                  type="file"
                  accept=".pdf,.jpeg,.png"
                  onChange={(e) => handleUpload(e.target.files[0])}
                />
              </div> */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex max-w-lg justify-center rounded-md border-2 border-dashed ${
                  dragOver ? `border-red-300` : `border-gray-300`
                }  px-6 pt-5 pb-6`}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      stroke-width="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex justify-center text-sm text-gray-600">
                    <label
                      htmlFor="file"
                      className={`relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500`}
                    >
                      {file ? (
                        <span className="text-center">File Received.</span>
                      ) : (
                        <span className="">Upload a file</span>
                      )}
                      <input
                        id="file"
                        name="resume"
                        type="file"
                        accept=".pdf,.jpeg,.png"
                        onChange={(e) => handleUpload(e.target.files[0])}
                        className="sr-only"
                      />
                    </label>
                    {!file && <p className="pl-1">or drag and drop</p>}
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              {status === "idle" ? (
                <button
                  className="border-1 mt-2 h-12 w-full rounded-md border-white text-xl text-white hover:bg-white hover:text-black"
                  type="submit"
                >
                  roast me, I guess.
                </button>
              ) : (
                <>{null}</>
              )}
            </form>
            <AnimatePresence>
              {start && roastsStatus === "loading" ? (
                <motion.div
                  key="loading"
                  className="flex justify-center"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                >
                  <RingLoader size={80} className="" color="white" />
                </motion.div>
              ) : status === "success" && roastsStatus === "success" ? (
                <div className={`${ibm.className} mb-20 lowercase text-white`}>
                  <Typewriter
                    onInit={(typewriter) => {
                      typewriter.pauseFor(2000);

                      let roastCount = 0;
                      for (const next of script) {
                        if (next.includes("ROAST")) {
                          typewriter.pauseFor(5000);
                          console.log(roasts[roastCount]);
                          typewriter.typeString(roasts[roastCount]);
                          roastCount += 1;
                        } else {
                          typewriter.pauseFor(2000);
                          typewriter.typeString(next);
                        }

                        typewriter.pauseFor(1000);
                        typewriter.typeString("<br />");
                        typewriter.pauseFor(50);
                        typewriter.typeString("<br />");
                      }

                      typewriter.start();
                    }}
                    options={{
                      delay: 60,
                    }}
                  />
                </div>
              ) : (
                <></>
              )}
            </AnimatePresence>
            <div className="mt-4 flex justify-center text-center text-white">
              <div className="mr-1">by</div>
              <motion.div whileHover={{ y: -5 }}>
                <a href="https://www.linkedin.com/in/jacob-braswell/">
                  Jacob Braswell
                </a>
              </motion.div>
              <div className="mx-1">
                {` `}&{` `}
              </div>
              <motion.div whileHover={{ y: -5 }}>
                <a href="https://twitter.com/hi_im_dev_">Isaac Tai</a>
              </motion.div>
            </div>
          </section>
        </section>
      </div>
    </>
  );
};

export default Handbook;
