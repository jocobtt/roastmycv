import React from "react";
import axios from "axios";

import Main from "../components/Main";
import { useMutation } from "@tanstack/react-query";
import { Metadata } from "../utils/pinecone";
import { RingLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { NextPage } from "next";

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

const Loading = () => {
  return (
    <motion.div
      key="loading"
      className="flex justify-center"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
    >
      <RingLoader size={80} className="" />
    </motion.div>
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
  const searchRef = React.useRef<HTMLInputElement>();

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

  React.useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  return (
    <>
      <Head>
        <title>ChatBOM</title>
        <meta name="description" content="Talk to the scriptures." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main>
        <section className="flex w-screen flex-col items-center px-4">
          <section className="flex w-96 flex-col">
            {/* <p className="px-10 py-3 text-black text-3xl">
              Chat<span className="text-grey font-bold">BOM</span>
            </p> */}
            <form onSubmit={handleSubmit} className="mb-4">
              <input
                ref={searchRef}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Who left Jerusalem with Lehi?"
                className="flex w-full flex-col rounded-md border-2 border-black p-2"
              />
              <button
                className="mt-2  w-full rounded-md border-2 border-black hover:bg-black hover:text-white"
                disabled={status === "loading"}
                type="submit"
              >
                {status === "success" || status === "error"
                  ? "Ask another question!"
                  : "Ask!"}
              </button>
            </form>
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
                <motion.section
                  initial={{ y: 100, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 1,
                      staggerChildren: 0.5,
                    },
                  }}
                >
                  <section className="flex flex-col rounded-md bg-white/50 p-2 text-left">
                    <p>🤖 ChatBOM:</p>
                    <i className="mt-4">{answer}</i>
                  </section>
                  <p className="mt-4">Verses that might be relevant: </p>
                  {relevantResources.map((answer) => {
                    return (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 100,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        key={answer.verse_id}
                      >
                        <div className="mt-2" />
                        <Answers {...answer} />
                      </motion.div>
                    );
                  })}
                </motion.section>
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
