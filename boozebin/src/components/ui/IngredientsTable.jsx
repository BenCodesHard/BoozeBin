'use client';

import { useIngredients } from "../useIngredients";
import PurpleButton from "./PurpleButton";
import FormInput from "./FormInput";
import Link from 'next/link';
import { useState } from 'react';

const IngredientTable = ({ user, onIngredientsChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    ingredient,
    setIngredient,
    ingredients,
    isLoading,
    error,
    handleAddIngredient,
    handleDeleteIngredient,
  } = useIngredients(user, onIngredientsChange);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && ingredient.trim()) {
      handleAddIngredient();
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex gap-2 mb-2">
        <div className="flex-1 pt-[10px]">
          <FormInput
            placeholder="Enter ingredient name"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="self-stretch flex items-center">
          <PurpleButton 
            onClick={handleAddIngredient} 
            disabled={isLoading || !ingredient.trim()}
          >
            {isLoading ? 'Adding...' : 'Add'}
          </PurpleButton>
        </div>
      </div>
      <div className="text-center mt-2 mb-2">
        <Link href="/image-detection" passHref>
          <span className="text-purple-400 hover:text-purple-300 cursor-pointer text-sm underline hover:underline">
            Have ingredients? Try our image detection!
          </span>
        </Link>
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {/* Ingredients box with show/hide functionality */}
      <div className="mt-4 flex items-center justify-between">
        <h3 className="text-white font-medium">Your Ingredients:</h3>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          {isCollapsed ? 'Show' : 'Hide'}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="mt-2 p-4 bg-purple-900/30 rounded-lg animate-fadeIn">
          {isLoading && ingredients.length === 0 ? (
            <p className="text-white/60">Loading ingredients...</p>
          ) : ingredients.length === 0 ? (
            <p className="text-white/60">No ingredients added yet</p>
          ) : (
            <div className="pr-2">
              <ul className="space-y-2">
                {ingredients.sort().map((item, index) => (
                  <li key={index} className="flex items-center justify-between gap-2 py-1 border-b border-purple-800/30 last:border-b-0 animate-fadeIn">
                    <span className="text-white truncate">{item}</span>
                    <button
                      onClick={() => handleDeleteIngredient(index)}
                      className="flex-shrink-0 ml-2 text-red-500 hover:text-red-300 transition-colors"
                      aria-label={`Delete ${item}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {isCollapsed && ingredients.length > 0 && (
        <div className="mt-2 text-white/60 text-sm">
          {ingredients.length} ingredients added
        </div>
      )}
    </div>
  );
};

export default IngredientTable;