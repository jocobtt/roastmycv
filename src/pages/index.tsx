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

const ScriptLine = ({ text, delay }) => {
  return (
    <section
      className={`flex flex-col rounded-md p-2 text-left lowercase ${ibm.className} text-white`}
    >
      <p className="mt-2 whitespace-pre-line"></p>
      <Typewriter
        onInit={(typewriter) => {
          typewriter
            .pauseFor(delay + 100)
            .typeString(text)
            .callFunction((state) => {
              state.elements.cursor.style.animation = "none";
              state.elements.cursor.style.display = "none";
            })
            .start();
        }}
        options={{
          delay: 30,
        }}
      />
    </section>
  );
};

const Roast = ({ id, resume, prevRoasts, addRoast, delay }) => {
  const { status, data } = useQuery(
    ["question", id],
    async () => {
      const res = await axios.post("/api/calls/roast", {
        text: resume,
        prevRoasts: prevRoasts,
      });
      return res.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  React.useEffect(() => {
    // const scrollingElement = document.scrollingElement || document.body;
    // scrollingElement.scrollTop = scrollingElement.scrollHeight;
  }, []);

  const text = React.useMemo(() => {
    if (status === "loading") {
      return "...";
    }
    const lower = data.answer.charAt(0).toLowerCase() + data.answer.slice(1);
    return lower;
  }, [status, data]);

  React.useEffect(() => {
    if (text !== "..." && prevRoasts.includes(text) === false) {
      addRoast(text);
    }
  }, [addRoast, prevRoasts, text]);
  return (
    <section
      className={`flex flex-col rounded-md p-2 text-left lowercase lowercase text-white ${ibm.className}`}
    >
      {status === "loading" ? (
        <p>...</p>
      ) : (
        <Typewriter
          onInit={(typewriter) => {
            typewriter
              .pauseFor(delay)
              .typeString(text)
              .callFunction((state) => {
                state.elements.cursor.style.animation = "none";
                state.elements.cursor.style.display = "none";
              })
              .start();
          }}
          options={{
            delay: 10,
          }}
        />
      )}
    </section>
  );
};

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
  "I'm not saying I'm bored but....",
  "[[ROAST4]]",
  "that's it. i'm done.",
  "i guess the important thing is that you believe in yourself...",
  "bye. i can't wait to do this again",
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
  const { status: roastsStatus, roasts } = useRoasts({
    resume: question,
    enabled: start,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");
    setStart(true);
  };

  React.useEffect(() => {
    if (status === "loading") {
      setTimeout(() => {
        setStatus("success");
      }, 6000);
    }
  }, [status]);

  const handleKeyDown = (e) => {
    if (e.which === 13 && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  React.useEffect(() => {
    searchRef.current.focus();
  }, []);

  return (
    <>
      <Head>
        <title>Roast My Resume</title>
        <meta name="description" content="Talk to the scriptures." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="to-blackbg-gradient-to-b min-h-screen bg-gradient-to-b  from-gray-700 via-gray-900  to-black pt-4 pb-4 pb-32">
        <nav className="flex justify-center">
          <div className="item-center flex flex-col justify-start">
            <p
              className={`5x-10 max-w-sm text-center text-4xl text-white ${monoton.className}`}
            >
              roast my resume
            </p>
          </div>
          {/* <div className="ml-auto">
          <button
          className="bg-gray/10 hover:bg-gray/20 rounded-full px-10 py-3 font-semibold text-white no-underline transition"
          onClick={authSessionData ? () => signOut() : () => signIn("google")}
          >
            {authSessionData ? "Sign out" : "Sign in"}
          </button>
        </div> */}
        </nav>
        <section className="mt-3 flex w-screen flex-col items-center">
          <section className="flex w-96 flex-col px-3">
            <form onSubmit={handleSubmit} className="mb-4">
              <textarea
                ref={searchRef}
                onKeyDown={handleKeyDown}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="resume goes here. don't worry about formatting it."
                className="border-1 flex h-48 w-full  resize-none scroll-m-0 flex-col rounded-md border-white bg-black p-2 text-xl text-white"
              />
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

            {/* <button onClick={() => setShow(true)}>Start</button> */}
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
            <div className="flex justify-center text-center text-white mt-4">
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
