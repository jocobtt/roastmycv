import { motion } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";

const Main = ({
  children,
  section,
}: {
  section?: string;
  children: React.ReactNode;
}) => {
  const { data: authSessionData } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-tl from-rose-100 to-teal-100 pb-4">
      <nav className="flex justify-center">
        <p className="px-10 py-3 text-xl text-black">
          Chat<span className="text-grey font-bold">BOM</span>
          {section ? ` - ${section}` : ""}
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
      {children}
      <footer className="mt-4 mb-4 flex justify-center">
        <div className="max-w-sm">
          <p className="text-center text-xs">
            <i>
              ChatBOM is not affiliated with or does not reflect the views of
              the Church of Jesus Christ of Latter-day Saints. AI chatbots are
              highly random and are prone to mistakes and misuse. It is also not
              sentient, we promise.
            </i>
          </p>
          <div className="mt-2 flex justify-center text-center">
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
        </div>
      </footer>
    </div>
  );
};

export default Main;
