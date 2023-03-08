import React from "react";
import axios from "axios";

import Main from "../components/Main";
import { useMutation } from "@tanstack/react-query";
import { RingLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { NextPage } from "next";

const Answers = ({ section, title, text, raw, source, revision_date }) => {
  return (
    <section className="flex flex-col rounded-md bg-white/50 p-2 text-left">
      <p>
        Section {section} - {title}
      </p>
      <p className="mt-2 whitespace-pre-line">{text.replaceAll(' • ', `\n • `)}</p>
    </section>
  );
};

const Loading = () => {
  return (
    <motion.div
      className="flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <RingLoader size={80} className="" />
    </motion.div>
  );
};

const Home: NextPage = () => {
  const [question, setQuestion] = React.useState("");
  const { mutate, status, data } = useMutation(["question"], async () => {
    const res = await axios.post("/api/calls/ask-handbook", {
      text: question,
    });
    console.log(res.data);
    return res.data;
  });

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

  return (
    <>
      <Head>
        <title>ChatBOM - Handbook</title>
        <meta name="description" content="Talk to the scriptures." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main section="General Handbook">
        <section className="flex w-screen flex-col items-center">
          <section className="flex w-96 flex-col">
            {/* <p className="px-10 py-3 text-black text-3xl">
              Chat<span className="text-grey font-bold">BOM</span>
            </p> */}
            <form onSubmit={handleSubmit} className="mb-4">
              <input
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Example: What are General Authorities?"
                className="flex w-full flex-col rounded-md border-2 border-black p-2"
              />
              <button
                className="mt-2  w-full rounded-md border-2 border-black hover:bg-black hover:text-white"
                disabled={status === "loading"}
                type="submit"
              >
                {status === "success" || "error"
                  ? "Ask another question!"
                  : "Ask!"}
              </button>
            </form>
            <AnimatePresence>
              {status === "loading" ? (
                <Loading />
              ) : status === "success" ? (
                <>
                  <section className="flex flex-col rounded-md bg-white/50 p-2 text-left">
                    <p>🤖 ChatBOM:</p>
                    <i className="mt-4">{answer}</i>
                  </section>
                  <p className="mt-4">Sections that might be relevant: </p>
                  {relevantResources.map((answer) => {
                    return (
                      <React.Fragment key={answer.verse_id}>
                        <div className="mt-2" />
                        <Answers {...answer} />
                      </React.Fragment>
                    );
                  })}
                </>
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
