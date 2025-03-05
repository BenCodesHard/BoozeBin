'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-tr from-black via-purple-900 to-black">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <Image
          src="/LogoWithText.png"
          alt="Booze Bin logo"
          width={300}
          height={38}
          priority
        />
        
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          // This is where you should add content for users who are signed in like CRUD funcitonality
          <div className="flex flex-col gap-4 items-center">
            <p className="text-center font-medium text-white">[DEBUG] {user.email} is currently signed in</p>
            <button
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-900 text-white gap-2 hover:opacity-90 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
            <a
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-900 text-white gap-2 hover:opacity-90 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              href="/login"
              rel="noopener noreferrer"
            >
              Log In
            </a>
            <a
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-900 text-white gap-2 hover:opacity-90 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              href="/register"
              rel="noopener noreferrer"
            >
              Register
            </a>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
       
      </footer>
    </div>
  );
}
