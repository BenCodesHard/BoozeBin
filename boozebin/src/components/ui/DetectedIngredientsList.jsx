'use client';

import { useState } from 'react';
import { Trash2, Check } from 'lucide-react';
import PurpleButton from './PurpleButton';

/**
 * Component for displaying and managing the list of detected ingredients.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.detectedIngredients - Array of detected ingredients
 * @param {Function} props.onRemoveIngredient - Function to remove an ingredient from the list
 * @param {Function} props.onConfirmIngredients - Function to confirm selected ingredients
 * @param {boolean} props.isLoading - Loading state
 */
const DetectedIngredientsList = ({ 
  detectedIngredients = [],
  onRemoveIngredient, 
  onConfirmIngredients,
  isLoading
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // Toggle ingredient selection
  const toggleIngredientSelection = (ingredient) => {
    setSelectedIngredients(prev => {
      const ingredientName = ingredient.name;
      if (prev.includes(ingredientName)) {
        return prev.filter(name => name !== ingredientName);
      } else {
        return [...prev, ingredientName];
      }
    });
  };
  // Handle confirmation of selected ingredients
  const handleConfirm = () => {
    const confirmedIngredients = detectedIngredients
      .filter(ingredient => selectedIngredients.includes(ingredient.name))
      .map(ingredient => ingredient.name);
    
    // Call parent handler and clear selections
    onConfirmIngredients(confirmedIngredients);
    setSelectedIngredients([]);
  };

  // Select all ingredients
  const selectAll = () => {
    setSelectedIngredients(detectedIngredients.map(ingredient => ingredient.name));
  };

  // Deselect all ingredients
  const deselectAll = () => {
    setSelectedIngredients([]);
  };

  return (
    <div className="w-full bg-[#1a1a2e]/70 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-medium">Detected Ingredients</h3>
        <div className="flex gap-2">
          <button 
            onClick={selectAll}
            className="text-xs text-purple-300 hover:text-purple-100 transition-colors"
          >
            Select All
          </button>
          <span className="text-gray-500">|</span>
          <button 
            onClick={deselectAll}
            className="text-xs text-purple-300 hover:text-purple-100 transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>
      
      {detectedIngredients.length === 0 ? (
        <div className="text-center text-purple-300 py-4">
          No ingredients detected yet
        </div>
      ) : (
        <>
          <ul className="max-h-[250px] overflow-y-auto space-y-2 mb-4">
            {detectedIngredients.map((ingredient, index) => {
              const isSelected = selectedIngredients.includes(ingredient.name);
              
              return (
                <li 
                  key={index}
                  className={`flex items-center justify-between p-2 rounded ${
                    isSelected ? 'bg-purple-900/50' : 'bg-[#232342]/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`ingredient-${index}`}
                      checked={isSelected}
                      onChange={() => toggleIngredientSelection(ingredient)}
                      className="h-4 w-4 accent-purple-600"
                    />
                    <label 
                      htmlFor={`ingredient-${index}`}
                      className="text-white cursor-pointer"
                    >
                      {ingredient.name}
                    </label>
                  </div>
                  <button
                    onClick={() => onRemoveIngredient(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    aria-label={`Remove ${ingredient.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
          
          <PurpleButton
            onClick={handleConfirm}
            disabled={isLoading || selectedIngredients.length === 0}
            className="w-full"
          >
            <Check size={16} />
            <span>Add Selected Ingredients</span>
          </PurpleButton>
        </>
      )}
    </div>
  );
};

export default DetectedIngredientsList;
