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

const LoadingState = () => (
  <div className="flex justify-center items-center">
    <p className="text-white">Loading...</p>
  </div>
);

const GeneratingDrinksState = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-[#0f0f1f]/90 rounded-xl w-full max-w-md mx-auto">
    <Loader2 className="h-8 w-8 text-purple-400 animate-spin mb-4" />
    <p className="text-white text-lg font-medium">Shaking up your options...</p>
    <p className="text-purple-300 text-sm mt-2">This may take a few moments</p>
  </div>
);

const LoggedInView = ({ user }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [allowExtras, setAllowExtras] = useState(false);
  const [isMocktail, setIsMocktail] = useState(false);
  const [quantity, setQuantity] = useState(5);
  const [drinkRecommendations, setDrinkRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleDrinkRecommendation = async (IsFakeDrink, type, quantity, allowExtras) => {
    console.log("extras", allowExtras)
    setIsGenerating(true);
    setDrinkRecommendations([]); // Clear previous recommendations

    try {
      const drinkRecommendationService = new DrinkRecommendationService();
      const recommendations = await drinkRecommendationService.getRecommendations(
        IsFakeDrink, 
        ingredients, 
        type, 
        quantity, 
        allowExtras
      );
      console.log(recommendations);
      setDrinkRecommendations(recommendations);
      setShowResults(true);
    } catch (error) {
      console.error("Error generating drink recommendations:", error);
      alert("There was a problem generating drink recommendations. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Generate button and title section */}
        <div className="w-full max-w-4xl flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold text-white">Find Your Perfect Drink</h2>
            {/* Controls section - this is where loading state appears */}
          <div className="w-full max-w-md flex flex-col items-center">
            {isGenerating ? (
              <GeneratingDrinksState />
            ) : (
              <>
                <PurpleButton
                  onClick={() => {
                    const drinkType = isMocktail ? "mocktail" : "cocktail";
                    handleDrinkRecommendation(false, drinkType, quantity, allowExtras);
                  }}
                  className="w-full max-w-md"
                >
                  Generate Recommendations
                </PurpleButton>

                {/* "Allow other ingredients" toggle */}
                <label className="flex items-center gap-2 text-sm text-purple-200 mt-2">
                  <input
                    type="checkbox"
                    checked={allowExtras}
                    onChange={() => setAllowExtras(!allowExtras)}
                    className="h-4 w-4 accent-purple-600"
                  />
                  Allow common bar staples
                </label>

                {/* "Mocktail only" toggle */}
                <label className="flex items-center gap-2 text-sm text-purple-200 mt-2">
                  <input
                    type="checkbox"
                    checked={isMocktail}
                    onChange={() => setIsMocktail(!isMocktail)}
                    className="h-4 w-4 accent-purple-600"
                  />
                  Generate Mocktails Only
                </label>

                {/* Drink Quantity Input */}
                <div className="flex items-center gap-2 text-sm text-purple-200 mt-4">
                  <label htmlFor="quantityInput" className="whitespace-nowrap">Number of Drinks:</label>
                  <input
                    id="quantityInput"
                    type="number"
                    min="1"
                    max="20"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
                    className="h-8 w-16 px-2 rounded bg-[#1a1a2e] border border-purple-700 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <p className="text-xs text-purple-300 text-center max-w-md">
                  We'll try to generate this many drinks, but results depend on your available ingredients.
                </p>
              </>
            )}
          </div>
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
                <p className="text-purple-300 text-center">
                  {showResults ? "No recommendations found for your ingredients" : "Click 'Generate Recommendations' to get drink suggestions"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
            <LoggedInView user={user} />
          ) : (
            <GuestView />
          )}
        </main>
        <footer className="flex gap-6 flex-wrap items-center justify-center"></footer>
      </div>
    </div>
  );
}
