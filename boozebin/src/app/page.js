"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import PurpleButton from "../components/ui/PurpleButton";
import IngredientTable from "@/components/ui/IngredientsTable";
import DrinkRecommendationService from "@/DrinkRecommendationService";
import DrinkRecommendationList from "@/components/ui/DrinkComponent";

// Loading state component
const LoadingState = () => (
  <div className="flex justify-center items-center">
    <p className="text-white">Loading...</p>
  </div>
);

// Logged in user component (view when logged in)
const LoggedInView = ({ user, onSignOut, handleDrinkRecommendation, children }) => {
  return (
    <div className="flex flex-col gap-4 items-center">
{/*}
      <p className="text-center font-medium text-white">
        [DEBUG] {user.email} is currently signed in
      </p>
      <p className="text-center font-medium text-purple-300">
        The button below will return the drink recommendations for the user, look in console log for output.
        Whoever is doing the display drink recomendation story needs to take this output and display it in a nice way.
      </p>
      <PurpleButton onClick={() => handleDrinkRecommendation(true)}>
        [DEBUG] Generate Drink Recommendations with fake data
      </PurpleButton>
      <PurpleButton onClick={() => handleDrinkRecommendation(false, "cocktail", 5)}>
        [DEBUG] Generate Drink Recommendations (Cocktails) with real data
      </PurpleButton>
      <PurpleButton onClick={() => handleDrinkRecommendation(false, "mocktail", 5)}>
        [DEBUG] Generate Drink Recommendations (Mocktails) with real data
      </PurpleButton>
      <PurpleButton onClick={onSignOut}>Sign Out</PurpleButton> 
*/}
      {children}
      <PurpleButton onClick={onSignOut}>Sign Out</PurpleButton> 

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
  const [ingredients, setIngredients] = useState([]); // State to store ingredients
  const [drinkRecommendations, setDrinkRecommendations] = useState([]); // State to store drink recommendations

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

  // Handle drink recommendation button click and call DrinkRecommendationService
  /**
   * Handles drink recommendations by fetching data from the DrinkRecommendationService
   * and updating the state with the recommendations.
   *
   * @param {Object} FakeOrDealData - The data used to determine whether the drink is fake or real.
   * @param {string} type - The type of drink to recommend (e.g., "cocktail", "mocktail").
   * @param {number} quantity - The number of drink recommendations to fetch.
   * @returns {Promise<void>} A promise that resolves when the recommendations are fetched and set.
   */
  const handleDrinkRecommendation = async (FakeOrDealData, type, quantity) => {
    const drinkRecommendationService = new DrinkRecommendationService();
    const recommendations = await drinkRecommendationService.getRecommendations(FakeOrDealData, ingredients, type, quantity);
    console.log(recommendations);
    setDrinkRecommendations(recommendations);
  };

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center
     min-h-screen p-8 pb-20 gap-4 sm:p-20 font-[family-name:var(--font-geist-sans)]"
      style={{
        backgroundImage: 'url("/backgroundBooze.jpg")',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      <main className="flex flex-col gap-8 row-start-2 w-full">
        {loading ? (
          <LoadingState />
        ) : user ? (
          <LoggedInView
            user={user}
            onSignOut={handleSignOut}
            handleDrinkRecommendation={handleDrinkRecommendation}
          >
            {drinkRecommendations.length > 0 && (
              // CHANGE HERE: Added user prop to DrinkRecommendationList
              <DrinkRecommendationList drinkRecommendations={drinkRecommendations} user={user} />)
            }
            <div className="flex gap-4 justify-center">
            <PurpleButton onClick={() => handleDrinkRecommendation(false, "cocktail", 5)}>
            Generate
      </PurpleButton>
            <IngredientTable user={user} onIngredientsChange={setIngredients} />
            </div>
          </LoggedInView>
        ) : (
          <GuestView />
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}