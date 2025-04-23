'use client';

import { useIngredients } from "../useIngredients";
import PurpleButton from "./PurpleButton";
import FormInput from "./FormInput";

const IngredientTable = ({ user, onIngredientsChange }) => {
  const {
    ingredient,
    setIngredient,
    ingredients,
    isLoading,
    error,
    handleAddIngredient,
    handleDeleteIngredient,
  } = useIngredients(user, onIngredientsChange);

  // Handle keypress to allow adding ingredient with Enter key
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
          <PurpleButton onClick={handleAddIngredient} disabled={isLoading || !ingredient.trim()}>
            {isLoading ? 'Adding...' : 'Add'}
          </PurpleButton>
        </div>
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
            {ingredients.sort().map((item, index) => (
              <li key={index} className="flex items-center justify-between gap-2">
                <span className="text-white">{item}</span>
                <button
                  onClick={() => handleDeleteIngredient(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  aria-label={`Delete ${item}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default IngredientTable;