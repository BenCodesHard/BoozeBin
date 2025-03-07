'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import PurpleButton from "../components/ui/PurpleButton";

// Loading state component
const LoadingState = () => (
  <div className="flex justify-center items-center">
    <p className="text-white">Loading...</p>
  </div>
);

// Logged in user component (view when logged in)
const LoggedInView = ({ user, onSignOut }) => (
  <div className="flex flex-col gap-4 items-center">
    <p className="text-center font-medium text-white">[DEBUG] {user.email} is currently signed in</p>
    <PurpleButton onClick={onSignOut}>
      Sign Out
    </PurpleButton>
  </div>
);

// Guest user component (view when not logged in)
const GuestView = () => (
  <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
    <PurpleButton href="/login">
      Log In
    </PurpleButton>
    <PurpleButton href="/register">
      Register
    </PurpleButton>
  </div>
);

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
          <LoadingState />
        ) : user ? (
          <LoggedInView user={user} onSignOut={handleSignOut} />
        ) : (
          <GuestView />
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
       
      </footer>
    </div>
  );
}
