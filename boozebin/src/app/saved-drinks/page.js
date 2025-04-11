"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import supabase from "@/supabaseClient";
import PurpleButton from "@/components/ui/PurpleButton";
import NavigationDropdown from "@/components/ui/NavigationDropdown";
import SavedDrinksList from "@/components/ui/SavedDrinkList";

// Loading state component
const LoadingState = () => (
  <div className="flex justify-center items-center">
    <p className="text-white">Loading...</p>
  </div>
);

export default function SavedDrinks() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedDrinks, setSavedDrinks] = useState([]);

  // Check for user session on component mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
      
      if (session?.user) {
        fetchSavedDrinks(session.user);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          fetchSavedDrinks(session.user);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch saved drinks for the user
  const fetchSavedDrinks = async (user) => {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select('*')
        .eq('email', user.email);
      
      if (error) {
        console.error("Error fetching saved drinks:", error);
        return;
      }
      
      setSavedDrinks(data || []);
    } catch (error) {
      console.error("Exception fetching saved drinks:", error);
    }
  };

  // Handle removing a drink from saved list
  const handleRemoveDrink = async (drinkName) => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase
        .from('drinks')
        .delete()
        .eq('email', user.email)
        .eq('drinkName', drinkName);

      if (error) {
        console.error("Error removing drink:", error);
        alert(`Failed to remove drink: ${error.message}`);
      } else {
        // Update local state to reflect the change
        setSavedDrinks(savedDrinks.filter(drink => drink.drinkName !== drinkName));
      }
    } catch (error) {
      console.error("Exception removing drink:", error);
      alert(`Exception removing drink: ${error.message}`);
    }
  };

  // Log out the user
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // When user is not logged in
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
      <p className="text-white text-lg">Please log in to view your saved drinks.</p>
      <div className="flex gap-12 items-center justify-center sm:flex-row flex-col">
        <PurpleButton href="/login">Log In</PurpleButton>
        <PurpleButton href="/register">Register</PurpleButton>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen font-[family-name:var(--font-geist-sans)]"
      style={{
        backgroundImage: 'url("/backgroundBooze.jpg")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="min-h-screen p-8 pb-20 sm:p-20 grid grid-rows-[auto_1fr_auto]">
        <NavigationDropdown 
          onSignOut={handleSignOut}
          isLoggedIn={!!user}
        />
        
        <main className="flex flex-col gap-8 w-full max-w-5xl mx-auto my-8">
          {loading ? (
            <LoadingState />
          ) : user ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">My Saved Drinks</h1>
                <p className="text-purple-300">
                  {savedDrinks.length > 0 
                    ? `You have ${savedDrinks.length} saved drink${savedDrinks.length !== 1 ? 's' : ''}.`
                    : "You don't have any saved drinks yet."}
                </p>
              </div>
              {savedDrinks.length > 0 ? (
                <SavedDrinksList drinks={savedDrinks} onRemoveDrink={handleRemoveDrink} />
              ) : (
                <div className="text-center text-white p-8 bg-[#1a1a2e]/70 rounded-xl">
                  <p>You haven't saved any drinks yet.</p>
                  <p className="mt-2">Go back to the home page to discover and save some drinks!</p>
                  <PurpleButton href="/" className="mt-4">Discover Drinks</PurpleButton>
                </div>
              )}
            </>
          ) : (
            <GuestView />
          )}
        </main>
        
        <footer className="flex gap-6 flex-wrap items-center justify-center"></footer>
      </div>
    </div>
  );
}