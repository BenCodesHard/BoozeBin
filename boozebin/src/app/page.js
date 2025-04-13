"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import supabase from "@/supabaseClient";
import PurpleButton from "@/components/ui/PurpleButton";
import IngredientTable from "@/components/ui/IngredientsTable";
import DrinkRecommendationService from "@/DrinkRecommendationService";
import DrinkRecommendationList from "@/components/ui/DrinkComponent";
import NavigationDropdown from "@/components/ui/NavigationDropdown";
import { Loader2 } from "lucide-react";

// Loading state component
const LoadingState = () => (
  <div className="flex justify-center items-center">
    <p className="text-white">Loading...</p>
  </div>
);

// Generating drinks loading state
const GeneratingDrinksState = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-[#0f0f1f]/90 rounded-xl w-full max-w-md mx-auto">
    <Loader2 className="h-8 w-8 text-purple-400 animate-spin mb-4" />
    <p className="text-white text-lg font-medium">Shaking up your options...</p>
    <p className="text-purple-300 text-sm mt-2">This may take a few moments</p>
  </div>
);

// Logged in user component (view when logged in)
const LoggedInView = ({ user, handleDrinkRecommendation, isGenerating, children }) => {
  return (


    /*   Placeholder just in case it is needed later
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
*/

    <div className="flex flex-col gap-6 items-center w-full">
      {isGenerating ? (
        <GeneratingDrinksState />
      ) : (
        children
      )}
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [ingredients, setIngredients] = useState([]); // State to store ingredients
  const [allowExtras, setAllowExtras] = useState(false);
  const [drinkRecommendations, setDrinkRecommendations] = useState([]); // State to store drink recommendations
  const [showResults, setShowResults] = useState(false);

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
  const handleDrinkRecommendation = async (FakeOrDealData, type, quantity, allowExtras) => {
    console.log("extras", allowExtras)
    setIsGenerating(true);
    setDrinkRecommendations([]); // Clear previous recommendations

    try {
      const drinkRecommendationService = new DrinkRecommendationService();
      const recommendations = await drinkRecommendationService.getRecommendations(FakeOrDealData, ingredients, type, quantity, allowExtras);
      console.log(recommendations);
      setDrinkRecommendations(recommendations);
      setShowResults(true); // Show the results section after generating
    } catch (error) {
      console.error("Error generating drink recommendations:", error);
      alert("There was a problem generating drink recommendations. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

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
        {/* Add the navigation dropdown with sign out functionality */}
        <NavigationDropdown
          onSignOut={handleSignOut}
          isLoggedIn={!!user}
        />

        <main className="flex flex-col gap-8 w-full my-8">
          {loading ? (
            <LoadingState />
          ) : user ? (
            <LoggedInView
              user={user}
              handleDrinkRecommendation={handleDrinkRecommendation}
              isGenerating={isGenerating}
            >
              <div className="flex flex-col items-center gap-6 w-full">
                {/* Generate button and title */}
                <div className="w-full max-w-4xl flex flex-col items-center gap-4">
                  <h2 className="text-xl font-semibold text-white">Find Your Perfect Drink</h2>
                  <PurpleButton
                    onClick={() => {
                      console.log("ui", allowExtras);
                      handleDrinkRecommendation(false, "cocktail", 5, allowExtras);
                    }}
                    className="w-full max-w-md"
                  >
                    Generate Recommendations
                  </PurpleButton>

                  {/* "Allow other ingredients" toggle */}
                  <label className="flex items-center gap-2 text-sm text-purple-200">
                    <input
                      type="checkbox"
                      checked={allowExtras}
                      onChange={() => setAllowExtras(!allowExtras)}
                      className="h-4 w-4 accent-purple-600"
                    />
                    Allow other ingredients
                  </label>

                  {/* Side by side layout after generating */}
                  {showResults ? (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {/* Left side: Ingredients table */}
                      <div className="bg-[#1a1a2e]/80 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-3">Your Ingredients</h3>
                        <IngredientTable user={user} onIngredientsChange={setIngredients} />
                      </div>

                      {/* Right side: Drink recommendations */}
                      <div className="bg-[#1a1a2e]/80 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-3">Recommendations</h3>
                        {drinkRecommendations.length > 0 ? (
                          <DrinkRecommendationList drinkRecommendations={drinkRecommendations} user={user} />
                        ) : (
                          <p className="text-purple-300 text-center">No drinks generated yet</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Initial view before generating */
                    <div className="w-full max-w-md">
                      <IngredientTable user={user} onIngredientsChange={setIngredients} />
                    </div>
                  )}
                </div>
              </div>
            </LoggedInView>
          ) : (
            <GuestView />
          )}
        </main>
        <footer className="flex gap-6 flex-wrap items-center justify-center"></footer>
      </div>
    </div>
  );
}
