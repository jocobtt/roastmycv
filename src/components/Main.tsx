import { signIn, signOut, useSession } from "next-auth/react";

const Main = ({ children }: { children: React.ReactNode }) => {
  const { data: authSessionData } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-tl from-rose-100 to-teal-100 pb-4">
      <nav className="flex justify-center">
        <p className="px-10 py-3 text-xl text-black">
          Chat<span className="text-grey font-bold">BOM</span>
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
        <p className="text-center">Jacob Braswell & Isaac Tai</p>
      </footer>
    </div>
  );
};

export default Main;
