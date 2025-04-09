'use client';

import { useState, useEffect } from "react";
import supabase from "@/supabaseClient";
import PurpleButton from "./PurpleButton";
import FormInput from "./FormInput";

const IngredientTable = ({ user, onIngredientsChange }) => {
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch ingredients from Supabase when component mounts
  useEffect(() => {
    fetchIngredients();
  }, [user?.email]);

  // Update the parent component whenever ingredients change
  useEffect(() => {
    if (onIngredientsChange) {
      onIngredientsChange(ingredients);
    }
  }, [ingredients, onIngredientsChange]);

  // Function to fetch ingredients from Supabase
  const fetchIngredients = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('ingredients')
        .select('stuff')
        .eq('email', user.email)
        .single();

      if (error) {
        // If no record exists yet, create one
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('ingredients')
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
      setError('An unexpected error occurred');
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
        .from('ingredients')
        .select('stuff')
        .eq('email', user.email)
        .single();
      
      if (fetchError) {
        // If record doesn't exist, create it
        if (fetchError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('ingredients')
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
          .from('ingredients')
          .update({ stuff: updatedIngredients })
          .eq('email', user.email);
        
        if (updateError) {
          setError(`Error updating record: ${updateError.message}`);
        } else {
          setIngredients(updatedIngredients);
          setIngredient(""); // Clear input field
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
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
      const updatedIngredients = ingredients.filter((_, index) => index !== indexToDelete);
      
      // Update Supabase
      const { error } = await supabase
        .from('ingredients')
        .update({ stuff: updatedIngredients })
        .eq('email', user.email);
      
      if (error) {
        setError(`Error updating record: ${error.message}`);
      } else {
        setIngredients(updatedIngredients);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
            {ingredients.map((item, index) => (
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