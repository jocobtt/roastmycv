import React, { useEffect } from "react";
import axios from "axios";

import Main from "../components/Main";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RingLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { NextPage } from "next";
import { Delay } from "../components/animation/Delay";
import { Monoton, IBM_Plex_Mono } from "@next/font/google";
import Typewriter from "typewriter-effect";

const monoton = Monoton({
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
  console.log({ prevRoasts });
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
      className={`flex flex-col rounded-md p-2 text-left lowercase text-white ${ibm.className}`}
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
  "analyzing your work experience...",
  "...this is a lot.",
  "[[ROAST1]]",
  "we're off to a great start...",
  "[[ROAST2]]",
  `this is my favorite thing to read on a ${new Date().toLocaleString("en-us", {
    weekday: "long",
  })}...`,
  "[[ROAST3]]",
  "are you sure you didn't just copy-paste this resume from a LinkedIn template?",
  "[[ROAST4]]",
  "I'm not saying I'm bored but....",
  "[[ROAST5]]",
  "that's it. i'm done.",
  "i guess the important thing is that you believe in yourself...",
  "bye. i can't wait to do this again",
];

const Handbook: NextPage = () => {
  const [question, setQuestion] = React.useState("");
  const [status, setStatus] = React.useState("idle");
  const [show, setShow] = React.useState(false);
  const [prevRoasts, setPrevRoasts] = React.useState([]);
  const searchRef = React.useRef<HTMLTextAreaElement>();

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");
  };

  React.useEffect(() => {
    if (status === "loading") {
      setTimeout(() => {
        setStatus("success");
      }, 2000);
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
          <p
            className={`5x-10 max-w-sm py-3 text-3xl text-white ${monoton.className}`}
          >
            roast my resume
          </p>
          {/* <div className="ml-auto">
          <button
            className="bg-gray/10 hover:bg-gray/20 rounded-full px-10 py-3 font-semibold text-white no-underline transition"
            onClick={authSessionData ? () => signOut() : () => signIn("google")}
          >
            {authSessionData ? "Sign out" : "Sign in"}
          </button>
        </div> */}
        </nav>
        <section className="mt-1 flex w-screen flex-col items-center">
          <section className="flex w-96 flex-col px-3">
            <form onSubmit={handleSubmit} className="mb-4">
              <textarea
                ref={searchRef}
                onKeyDown={handleKeyDown}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Input your resume here."
                className="flex h-48 w-full resize-none  scroll-m-0 flex-col rounded-md border-2 border-white bg-black p-2 text-xl text-white"
              />
              {status === "idle" ? (
                <button
                  className="mt-2 h-12 w-full rounded-md border-2 border-white text-xl text-white hover:bg-white hover:text-black"
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
              {status === "loading" ? (
                <motion.div
                  key="loading"
                  className="flex justify-center"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                >
                  <RingLoader size={80} className="" color="white" />
                </motion.div>
              ) : status === "success" ? (
                <motion.div key="joy">
                  {/* <section className="flex flex-col rounded-md bg-white/50 p-2 text-left">
                    <p>🤖 ChatBOM:</p>
                    <i className="mt-4">{answer}</i>
                  </section>
                  <p className="mt-4">Sections that may be relevant: </p> */}
                  <AnimatePresence>
                    {/* <Delay key="relevant-sections" delay={1000}> */}
                    <motion.div
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      {script.map((answer, index) => {
                        return (
                          <motion.div
                            key={answer}
                            initial={{ y: 0, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                              y: 100,
                              duration: 0.5,
                              delay: 7 * index,
                            }}
                            className="mt-2"
                          >
                            {answer.includes("ROAST") ? (
                              <Roast
                                id={index}
                                resume={question}
                                prevRoasts={prevRoasts}
                                addRoast={(roast) =>
                                  setPrevRoasts((prev) => [...prev, roast])
                                }
                                delay={7000 * index}
                              />
                            ) : (
                              <ScriptLine
                                key={index}
                                text={answer}
                                delay={7000 * index}
                              />
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                    {/* </Delay> */}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <></>
                // <pre className="mt-4">{data}</pre>
              )}
            </AnimatePresence>
            <div className="mt-2 flex justify-center text-center text-white">
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
                <a href="https://www.linkedin.com/in/ztai">Isaac Tai</a>
              </motion.div>
            </div>
          </section>
        </section>
      </div>
    </>
  );
};

export default Handbook;
