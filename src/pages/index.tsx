import React from "react";
import axios from "axios";

import Main from "../components/Main";
import { useMutation } from "@tanstack/react-query";
import { Metadata } from "../utils/pinecone";
import { RingLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { NextPage } from "next";
import { Delay } from "../components/animation/Delay";

const Answers = ({
  book_id,
  chapter_id,
  verse_id,
  volume_title,
  book_title,
  volume_long_title,
  book_long_title,
  volume_subtitle,
  book_subtitle,
  volume_short_title,
  book_short_title,
  volume_lds_url,
  book_lds_url,
  chapter_number,
  verse_number,
  scripture_text,
  verse_title,
  verse_short_title,
}: Partial<Metadata>) => {
  return (
    <section className="flex flex-col rounded-md bg-white/50 p-2 text-left">
      <p>
        {book_short_title} {chapter_number}:{verse_number}
      </p>
      <p>{scripture_text}</p>
    </section>
  );
};

const Home: NextPage = () => {
  const [question, setQuestion] = React.useState("");
  const { mutate, status, data } = useMutation(["question"], async () => {
    const res = await axios.post("/api/calls/ask", {
      text: question,
    });
    console.log(res.data);
    return res.data;
  });
  const searchRef = React.useRef<HTMLTextAreaElement>();
  const [show, setShow] = React.useState(false);

  const { answer, relevantResources } = React.useMemo(() => {
    console.log({ status, data });
    if (status === "success") {
      return { answer: data.answer, relevantResources: data.relevantResources };
    }

    return { answer: undefined, relevantResources: [] };
  }, [status, data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

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
        <title>ChatBOM</title>
        <meta name="description" content="Talk to the scriptures." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main>
        <section className="mt-1 flex w-screen flex-col items-center">
          <section className="flex w-96 flex-col px-3">
            <form onSubmit={handleSubmit} className="mb-4">
              <textarea
                ref={searchRef}
                onKeyDown={handleKeyDown}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Example: Where is the Sword of Laban?"
                className="flex h-24 w-full resize-none flex-col rounded-md border-2 border-black p-2 text-xl"
              />
              <button
                className="mt-2 h-12 w-full rounded-md border-2 border-black text-xl hover:bg-black hover:text-white"
                disabled={status === "loading"}
                type="submit"
              >
                {status === "success" || status === "error"
                  ? "Ask another question!"
                  : "Ask!"}
              </button>
            </form>
            {/* <button onClick={() => setShow((prev) => !prev)}>toggle</button> */}
            <AnimatePresence>
              {status === "loading" ? (
                <motion.div
                  key="loading"
                  className="flex justify-center"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                >
                  <RingLoader size={80} className="" />
                </motion.div>
              ) : status === "success" ? (
                <motion.div
                  key="joy"
                  // initial={{ opacity: 0 }}
                  // animate={{
                  //   opacity: 1,
                  //   transition: {
                  //     duration: 800,
                  //   },
                  // }}
                >
                  <section className="flex flex-col rounded-md bg-white/50 p-2 text-left">
                    <p>🤖 ChatBOM:</p>
                    <i className="mt-4">{answer}</i>
                  </section>
                  <p className="mt-4">Verses that might be relevant: </p>
                  <AnimatePresence>
                    <Delay key="relevant-sections" delay={1000}>
                      {relevantResources.map((answer, index) => {
                        return (
                          <Delay key={index} delay={index * 300}>
                            <div className="mt-2" />
                            <motion.div
                              initial={{ y: 100, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ y: 100, duration: 0.5 }}
                            >
                              <Answers {...answer} />
                            </motion.div>
                          </Delay>
                        );
                      })}
                    </Delay>
                  </AnimatePresence>
                </motion.div>
              ) : (
                <pre className="mt-4">{data}</pre>
              )}
            </AnimatePresence>
          </section>
        </section>
      </Main>
    </>
  );
};

export default Home;
