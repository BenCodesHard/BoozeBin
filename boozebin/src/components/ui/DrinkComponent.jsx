"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollShadow } from "@heroui/react";
import supabase from "@/supabaseClient"; 

const DrinkRecommendation = ({ drinkRecommendation, user }) => {
  const [favorited, setFavorited] = useState(false);

  // Check if the drink is already favorited on component mount
  useEffect(() => {
    const checkIfFavorited = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('drinks')
          .select('*')
          .eq('email', user.email)
          .eq('drinkName', drinkRecommendation.drinkName)
          .single();
        
        if (data && !error) {
          setFavorited(true);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkIfFavorited();
  }, [user, drinkRecommendation.drinkName]);

  const toggleFavorite = async () => {
    if (!user?.email) {
      alert("Please log in to favorite drinks");
      return;
    }

    const newFavoritedState = !favorited;
    setFavorited(newFavoritedState);

    if (newFavoritedState) {
      // Add to favorites
      try {
        // Extract ingredient names from the ingredients array to match text[] type
        const componentsArray = Array.isArray(drinkRecommendation.ingredients) 
          ? drinkRecommendation.ingredients.map(ing => ing.name + " - " + ing.quantity)
          : [];

        const { error } = await supabase
          .from('drinks')
          .insert({
            email: user.email,
            drinkName: drinkRecommendation.drinkName,
            components: componentsArray, // Converting to string array for text[] type
            instructions: drinkRecommendation.instructions
          })
          .select();  // Add select() to get back the result for debugging

        if (error) {
          console.error("Error saving drink:", error);
          setFavorited(false); // Revert UI state on error
          alert(`Failed to save drink: ${error.message}`);
        } else {
          console.log("Drink saved successfully!");
        }
      } catch (error) {
        console.error("Exception saving drink:", error);
        setFavorited(false);
        alert(`Exception saving drink: ${error.message}`);
      }
    } else {
      // Remove from favorites
      try {
        const { error } = await supabase
          .from('drinks')
          .delete()
          .eq('email', user.email)
          .eq('drinkName', drinkRecommendation.drinkName);

        if (error) {
          console.error("Error removing drink:", error);
          setFavorited(true); // Revert UI state on error
          alert(`Failed to remove drink: ${error.message}`);
        } else {
          console.log("Drink removed successfully!");
        }
      } catch (error) {
        console.error("Exception removing drink:", error);
        setFavorited(true);
        alert(`Exception removing drink: ${error.message}`);
      }
    }
  };

  return (
    <Card className="relative bg-[#1a1a2e]/70 p-6 rounded-2xl shadow-md border border-[#2f2f4f] w-full mx-auto">
      <button
        onClick={toggleFavorite}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#2f2f4f] transition-colors"
        aria-label="Favorite"
      >
        <Heart
          size={20}
          className={favorited ? "fill-red-500 stroke-red-500" : "stroke-[#a0a0ff]"}
        />
      </button>
      <h1 className="text-2xl font-bold text-[#e0e0ff] mb-4">
        {drinkRecommendation.drinkName || "Unnamed Drink"}
      </h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#a0a0ff] mb-2">Ingredients:</h2>
        {Array.isArray(drinkRecommendation.ingredients) ? (
          <ScrollShadow size={100} className="max-h-[180px] pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <ul className="list-disc list-inside text-[#d0d0ff] space-y-1">
              {drinkRecommendation.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{ingredient.name}</span> - {ingredient.quantity}
                </li>
              ))}
            </ul>
          </ScrollShadow>
        ) : (
          <p className="text-sm text-[#8080a0]">No ingredients available</p>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[#a0a0ff] mb-2">Instructions:</h2>
        <p className="text-sm text-[#d0d0ff]">
          {drinkRecommendation.instructions || "No instructions provided."}
        </p>
      </div>
    </Card>
  );
};

const DrinkRecommendationList = ({ drinkRecommendations, user }) => {
  return (
    <div className="flex flex-col gap-6 p-6 bg-[#0f0f1f] max-h-[650px] overflow-y-auto rounded-xl w-full items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {drinkRecommendations.map((drink, index) => (
        <DrinkRecommendation key={index} drinkRecommendation={drink} user={user} />
      ))}
    </div>
  );
};

export default DrinkRecommendationList;