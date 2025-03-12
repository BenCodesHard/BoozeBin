"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import PurpleButton from "../components/ui/PurpleButton";
import FormInput from "@/components/ui/FormInput";

// Loading state component
const LoadingState = () => (
  <div className="flex justify-center items-center">
    <p className="text-white">Loading...</p>
  </div>
);

// Logged in user component (view when logged in)
const LoggedInView = ({ user, onSignOut }) => {
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch ingredients from Supabase when component mounts
  useEffect(() => {
    fetchIngredients();
  }, [user?.email]);

  // Function to fetch ingredients from Supabase
  const fetchIngredients = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("ingredients")
        .select("stuff")
        .eq("email", user.email)
        .single();

      if (error) {
        // If no record exists yet, create one
        if (error.code === "PGRST116") {
          const { error: insertError } = await supabase
            .from("ingredients")
            .insert({ email: user.email, stuff: [] });

          if (insertError) {
            setError(`Error creating record: ${insertError.message}`);
          } else {
            setIngredients([]);
          }
        } else {
          setError(`Error fetching data: ${error.message}`);
        }
      } else {
        setIngredients(data?.stuff || []);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Add ingredient to Supabase
  const handleAddIngredient = async () => {
    if (!ingredient.trim() || !user?.email) return;

    try {
      setIsLoading(true);
      setError(null);

      // First try to get the current data
      const { data: currentData, error: fetchError } = await supabase
        .from("ingredients")
        .select("stuff")
        .eq("email", user.email)
        .single();

      if (fetchError) {
        // If record doesn't exist, create it
        if (fetchError.code === "PGRST116") {
          const { error: insertError } = await supabase
            .from("ingredients")
            .insert({ email: user.email, stuff: [ingredient] });

          if (insertError) {
            setError(`Error creating record: ${insertError.message}`);
          } else {
            setIngredients([ingredient]);
            setIngredient(""); // Clear input field
          }
        } else {
          setError(`Error fetching current data: ${fetchError.message}`);
        }
      } else {
        // Create new array with current ingredients and new one
        const updatedIngredients = [...(currentData?.stuff || []), ingredient];

        // Update Supabase
        const { error: updateError } = await supabase
          .from("ingredients")
          .update({ stuff: updatedIngredients })
          .eq("email", user.email);

        if (updateError) {
          setError(`Error updating record: ${updateError.message}`);
        } else {
          setIngredients(updatedIngredients);
          setIngredient(""); // Clear input field
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a specific ingredient
  const handleDeleteIngredient = async (indexToDelete) => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      setError(null);

      // Remove the specific ingredient
      const updatedIngredients = ingredients.filter(
        (_, index) => index !== indexToDelete
      );

      // Update Supabase
      const { error } = await supabase
        .from("ingredients")
        .update({ stuff: updatedIngredients })
        .eq("email", user.email);

      if (error) {
        setError(`Error updating record: ${error.message}`);
      } else {
        setIngredients(updatedIngredients);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keypress to allow adding ingredient with Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && ingredient.trim()) {
      handleAddIngredient();
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <p className="text-center font-medium text-white">
        [DEBUG] {user.email} is currently signed in
      </p>
      <PurpleButton onClick={onSignOut}>Sign Out</PurpleButton>

      <div className="w-full max-w-md">
        <FormInput
          label="Ingredients"
          placeholder="Enter ingredient name"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <div className="flex gap-2 mt-2">
          <PurpleButton
            onClick={handleAddIngredient}
            disabled={isLoading || !ingredient.trim()}
          >
            {isLoading ? "Adding..." : "Add"}
          </PurpleButton>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Display current ingredients with checkboxes */}
        <div className="mt-4 p-4 bg-purple-900/30 rounded-lg">
          <h3 className="text-white font-medium mb-2">Your Ingredients:</h3>
          {isLoading ? (
            <p className="text-white/60">Loading ingredients...</p>
          ) : ingredients.length === 0 ? (
            <p className="text-white/60">No ingredients added yet</p>
          ) : (
            <ul className="space-y-2">
              {ingredients.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`ingredient-${index}`}
                    className="h-4 w-4 rounded border-gray-300"
                    onChange={() => handleDeleteIngredient(index)}
                  />
                  <label
                    htmlFor={`ingredient-${index}`}
                    className="text-white cursor-pointer"
                  >
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
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
      priority >
    </Image>
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center
     min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
     style={{
      backgroundImage: 'url("/backgroundBooze.jpg")',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
    }}>
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
