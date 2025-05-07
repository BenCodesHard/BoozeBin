"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const SavedDrink = ({ drink, onRemove }) => {
  return (
    <Card className="relative bg-[#1a1a2e]/70 p-6 rounded-2xl shadow-md border border-[#2f2f4f] w-full mx-auto">
      <button
        onClick={() => onRemove(drink.drinkName)}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-900/50 transition-colors text-red-400 hover:text-red-300"
        aria-label="Remove drink"
      >
        <Trash2 size={18} />
      </button>
      
      <h1 className="text-2xl font-bold text-[#e0e0ff] mb-4">
        {drink.drinkName || "Unnamed Drink"}
      </h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#a0a0ff] mb-2">Ingredients:</h2>
        {Array.isArray(drink.components) && drink.components.length > 0 ? (
          <div className="max-h-[180px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <ul className="list-disc list-inside text-[#d0d0ff] space-y-1">
              {drink.components.map((component, index) => (
                <li key={index} className="text-sm">{component}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-[#8080a0]">No ingredients available</p>
        )}
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-[#a0a0ff] mb-2">Instructions:</h2>
        <p className="text-sm text-[#d0d0ff]">
          {drink.instructions || "No instructions provided."}
        </p>
      </div>
    </Card>
  );
};

const SavedDrinksList = ({ drinks, onRemoveDrink }) => {
  return (
    <div className="flex flex-col gap-6 p-6 bg-[#0f0f1f]/90 max-h-[650px] overflow-y-auto rounded-xl w-full items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {drinks.map((drink, index) => (
        <SavedDrink 
          key={index} 
          drink={drink} 
          onRemove={onRemoveDrink} 
        />
      ))}
    </div>
  );
};

export default SavedDrinksList;