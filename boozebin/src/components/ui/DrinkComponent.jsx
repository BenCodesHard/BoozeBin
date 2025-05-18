"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollShadow } from "@/components/ui/ScrollShadow";
import supabase from "@/supabaseClient";

const apiKey = process.env.NEXT_PUBLIC_UNSPLASHED_KEY;

const fetchUnsplashImage = async (query) => {
  if (!query || query.toLowerCase().includes("undefined")) return null;

  const normalizedQuery = query.toLowerCase().trim();
  const storageKey = `${normalizedQuery}_image`;
  const cached = localStorage.getItem(storageKey);
  if (cached) return cached;

  const combinedQuery = `cocktail drink ${normalizedQuery}`;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(combinedQuery)}&client_id=${apiKey}&per_page=10`
    );
    const data = await response.json();
    const results = data.results || [];

    const randomImage = results.length
      ? results[Math.floor(Math.random() * results.length)]?.urls?.regular
      : null;

    if (randomImage) {
      localStorage.setItem(storageKey, randomImage);
    }

    return randomImage;
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    return null;
  }
};

const DrinkRecommendation = ({ drinkRecommendation, user }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getImage = async () => {
      if(drinkRecommendation.drinkName != null){
      const query = drinkRecommendation.drinkName;
      const url = await fetchUnsplashImage(query);
      console.log("Fetched image URL:", url, "for query:", query);
      setImageUrl(url);
      drinkRecommendation.imageUrl = url;
      }
    };
    getImage();
  }, [drinkRecommendation]);

  const [favorited, setFavorited] = useState(false);

  // Check if the drink is already favorited on component mount
  useEffect(() => {
    const checkIfFavorited = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("drinks")
          .select("*")
          .eq("email", user.email)
          .eq("drinkName", drinkRecommendation.drinkName)
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
          ? drinkRecommendation.ingredients.map(
              (ing) => ing.name + " - " + ing.quantity
            )
          : [];

        const { error } = await supabase
          .from("drinks")
          .insert({
            email: user.email,
            drinkName: drinkRecommendation.drinkName,
            components: componentsArray, // Converting to string array for text[] type
            instructions: drinkRecommendation.instructions,
          })
          .select(); // Add select() to get back the result for debugging

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
          .from("drinks")
          .delete()
          .eq("email", user.email)
          .eq("drinkName", drinkRecommendation.drinkName);

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
    <Card className="relative bg-[#1a1a2e]/70 p-4 sm:p-6 rounded-2xl shadow-md border border-[#2f2f4f] w-full mx-auto animate-slideIn">
      <button
        onClick={toggleFavorite}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1 rounded-full hover:bg-[#2f2f4f] transition-colors"
        aria-label="Favorite"
      >
        <Heart
          size={20}
          className={
            favorited ? "fill-red-500 stroke-red-500" : "stroke-[#a0a0ff]"
          }
        />
      </button>

      {/* Flex container for content - stack on mobile, side-by-side on larger screens */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Drink image - visible on all screens, positioned differently */}
        <div className="sm:w-32 md:w-40 lg:w-48 aspect-square flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={imageUrl || drinkRecommendation.imageUrl || "/Cocktails_PLaceHolder.jpg"}
            alt={drinkRecommendation.drinkName || "Drink image"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        {/* Text content */}
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[#e0e0ff] mb-3 sm:mb-4">
            {drinkRecommendation.drinkName || "Unnamed Drink"}
          </h1>
          <div className="mb-3 sm:mb-4">            <h2 className="text-base sm:text-lg font-semibold text-[#a0a0ff] mb-2">
              Ingredients:
            </h2>
            {Array.isArray(drinkRecommendation.ingredients) ? (
              <div className="pr-2">
                <ul className="list-disc list-inside text-[#d0d0ff] space-y-1">
                  {drinkRecommendation.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{ingredient.name}</span> -{" "}
                      {ingredient.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ): (
              <p className="text-sm text-[#8080a0]">No ingredients available</p>
            )}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#a0a0ff] mb-2">
              Instructions:
            </h2>
            <p className="text-sm text-[#d0d0ff]">
              {drinkRecommendation.instructions || "No instructions provided."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const DrinkRecommendationList = ({ drinkRecommendations, user }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  
  // Function to load more items
  const loadMoreItems = () => {
    if (isLoading || visibleCount >= drinkRecommendations.length) return;
    
    setIsLoading(true);
    // Simulate loading delay for smoother UX
    setTimeout(() => {
      setVisibleCount(prevCount => Math.min(prevCount + 3, drinkRecommendations.length));
      setIsLoading(false);
    }, 300);
  };

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const options = {
      root: null, // Use viewport as root
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreItems();
      }
    }, options);
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [drinkRecommendations.length, visibleCount, isLoading]);
  
  // Attach observer to sentinel element when it exists
  useEffect(() => {
    const sentinel = document.getElementById('drink-list-sentinel');
    if (sentinel && observerRef.current) {
      observerRef.current.observe(sentinel);
    }
    
    return () => {
      if (sentinel && observerRef.current) {
        observerRef.current.unobserve(sentinel);
      }
    };
  }, [visibleCount, drinkRecommendations.length]);
  
  return (
    <div 
      ref={containerRef}
      className="flex flex-col gap-4 sm:gap-6 w-full"
    >
      {drinkRecommendations.slice(0, visibleCount).map((drink, index) => (
        <DrinkRecommendation
          key={index}
          drinkRecommendation={drink}
          user={user}
        />
      ))}
      
      {/* Loading indicator and sentinel element for infinite scroll */}
      {visibleCount < drinkRecommendations.length && (
        <div id="drink-list-sentinel" className="w-full flex justify-center py-4">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
            <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
            <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
          </div>
        </div>
      )}
      
      {/* Empty state message */}
      {drinkRecommendations.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <p className="text-[#a0a0ff] mb-2">No drink recommendations available</p>
          <p className="text-sm text-[#8080a0]">Try adding more ingredients or different combinations</p>
        </div>
      )}
    </div>
  );
};

export default DrinkRecommendationList;
