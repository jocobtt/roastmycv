import React from "react";
import axios from "axios";

import Main from "../components/Main";
import { useMutation } from "@tanstack/react-query";
import { Metadata } from "../utils/pinecone";
import { PacmanLoader, RingLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";

// const Home: NextPage = () => {
//   const [feature, setFeature] = React.useState<"search" | "library">("search");
//   const { data: authSessionData } = useSession();

//   const featureComponent = feature === "search" ? <Search /> : <Library />;

//   return (
//     <>
//       <Head>
//         <title>ChatBOM</title>
//         <meta name="description" content="Talk to the scriptures." />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <Main>
//         {authSessionData ? (
//           <>
//             <span className="isolate mb-10 inline-flex rounded-md shadow-sm">
//               <button
//                 type="button"
//                 className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                 onClick={() => setFeature("search")}
//               >
//                 Search
//               </button>

//               <button
//                 type="button"
//                 className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                 onClick={() => setFeature("library")}
//               >
//                 Library
//               </button>
//             </span>

//             {featureComponent}
//           </>
//         ) : (
//           <div>
//             <h1 className="text-4xl font-extrabold text-white sm:text-[5rem]">
//               Chat<span className="text-search">BOM</span>
//             </h1>
//             <h3 className="mt-10 text-2xl text-white">
//               <span
//                 className="cursor-pointer text-search"
//                 onClick={() => signIn("google")}
//               >
//                 Signin
//               </span>{" "}
//               to continue
//             </h3>
//           </div>
//         )}
//       </Main>

//       <Toaster />
//     </>
//   );
// };

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
    const res = await axios.post("/api/calls/ask", {
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
        <title>ChatBOM</title>
        <meta name="description" content="Talk to the scriptures." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main>
        <section className="flex w-screen flex-col items-center">
          <section className="flex w-96 flex-col">
            {/* <p className="px-10 py-3 text-black text-3xl">
              Chat<span className="text-grey font-bold">BOM</span>
            </p> */}
            <form onSubmit={handleSubmit}>
              <input
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Who left Jerusalem with Lehi?"
                className="flex w-full flex-col rounded-md border-2 border-black p-2"
              />
              <button
                className="mt-2 mb-6  w-full rounded-md border-2 border-black hover:bg-black hover:text-white"
                disabled={status === "loading"}
                type="submit"
              >
                Ask!
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
                  <p className="mt-4">Verses that might be relevant: </p>
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
