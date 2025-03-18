"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import PurpleButton from "../components/ui/PurpleButton";
import IngredientTable from "@/components/ui/IngredientsTable";

// Loading state component
const LoadingState = () => (
  <div className="flex justify-center items-center">
    <p className="text-white">Loading...</p>
  </div>
);

// Logged in user component (view when logged in)
const LoggedInView = ({ user, onSignOut }) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <p className="text-center font-medium text-white">
        [DEBUG] {user.email} is currently signed in
      </p>
      <PurpleButton onClick={onSignOut}>Sign Out</PurpleButton>
      <IngredientTable user={user} />
    </div>
  );
};

// Guest user component (view when not logged in)
const GuestView = () => (
  <div className="flex flex-col gap-4 items-center justify-center">
    <Image
      src="/boozebinLogoTransparent.PNG"
      alt="Booze Bin logo"
      width={300}
      height={38}
      className="mb-4"
      priority
    />
    <div className="flex gap-12 items-center justify-center sm:flex-row flex-col">
      <PurpleButton href="/login">Log In</PurpleButton>
      <PurpleButton href="/register">Register</PurpleButton>
    </div>
  </div>
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Look for if there is a user session (logging in)
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Log out the user
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center
     min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
      style={{
        backgroundImage: 'url("/backgroundBooze.jpg")',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      <main className="flex flex-col gap-8 row-start-2 items-center">
        {loading ? (
          <LoadingState />
        ) : user ? (
          <LoggedInView user={user} onSignOut={handleSignOut} />
        ) : (
          <GuestView />
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}