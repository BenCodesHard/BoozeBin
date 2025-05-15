"use client";

import React, { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollShadow } from "@/components/ui/ScrollShadow";

const SavedDrink = ({ drink, onRemove }) => {
  return (
    <Card className="relative bg-[#1a1a2e]/70 p-4 sm:p-6 rounded-2xl shadow-md border border-[#2f2f4f] w-full mx-auto animate-slideIn">
      <button
        onClick={() => onRemove(drink.drinkName)}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-red-900/50 transition-colors text-red-400 hover:text-red-300"
        aria-label="Remove drink"
      >
        <Trash2 size={16} />
      </button>
      
      <h1 className="text-xl sm:text-2xl font-bold text-[#e0e0ff] mb-3 sm:mb-4">
        {drink.drinkName || "Unnamed Drink"}
      </h1>
      
      <div className="mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-[#a0a0ff] mb-2">Ingredients:</h2>
        {Array.isArray(drink.components) && drink.components.length > 0 ? (
          <ScrollShadow
            size={100}
            className="max-h-[150px] sm:max-h-[180px] pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <ul className="list-disc list-inside text-[#d0d0ff] space-y-1">
              {drink.components.map((component, index) => (
                <li key={index} className="text-sm">{component}</li>
              ))}
            </ul>
          </ScrollShadow>
        ) : (
          <p className="text-sm text-[#8080a0]">No ingredients available</p>
        )}
      </div>
      
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-[#a0a0ff] mb-2">Instructions:</h2>
        <p className="text-sm text-[#d0d0ff]">
          {drink.instructions || "No instructions provided."}
        </p>
      </div>
    </Card>
  );
};

const SavedDrinksList = ({ drinks, onRemoveDrink }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  
  // Function to load more items
  const loadMoreItems = () => {
    if (isLoading || visibleCount >= drinks.length) return;
    
    setIsLoading(true);
    // Simulate loading delay for smoother UX
    setTimeout(() => {
      setVisibleCount(prevCount => Math.min(prevCount + 3, drinks.length));
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
  }, [drinks.length, visibleCount, isLoading]);
  
  // Attach observer to sentinel element when it exists
  useEffect(() => {
    const sentinel = document.getElementById('saved-drink-sentinel');
    if (sentinel && observerRef.current) {
      observerRef.current.observe(sentinel);
    }
    
    return () => {
      if (sentinel && observerRef.current) {
        observerRef.current.unobserve(sentinel);
      }
    };
  }, [visibleCount, drinks.length]);
  
  return (
    <div 
      ref={containerRef}
      className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 bg-[#0f0f1f]/90 h-[calc(100vh-300px)] max-h-[650px] overflow-y-auto rounded-xl w-full items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {drinks.slice(0, visibleCount).map((drink, index) => (
        <SavedDrink 
          key={index} 
          drink={drink} 
          onRemove={onRemoveDrink} 
        />
      ))}
      
      {/* Loading indicator and sentinel element for infinite scroll */}
      {visibleCount < drinks.length && (
        <div id="saved-drink-sentinel" className="w-full flex justify-center py-4">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
            <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
            <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
          </div>
        </div>
      )}
      
      {/* Empty state message */}
      {drinks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <p className="text-[#a0a0ff] mb-2">No saved drinks yet</p>
          <p className="text-sm text-[#8080a0]">Your favorites will appear here once you've saved some drinks</p>
        </div>
      )}
    </div>
  );
};

export default SavedDrinksList;