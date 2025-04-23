import { useState, useEffect, useCallback } from "react";
import supabase from "@/supabaseClient";

export function useIngredients(user, onIngredientsChange) {
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch ingredients from Supabase when component mounts
  const fetchIngredients = useCallback(async () => {
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
  }, [user?.email]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  useEffect(() => {
    if (onIngredientsChange) {
      onIngredientsChange(ingredients);
    }
  }, [ingredients, onIngredientsChange]);

  // Add ingredient to Supabase with optimistic UI update
  const handleAddIngredient = useCallback(async () => {
    if (!ingredient.trim() || !user?.email) return;

    const newIngredient = ingredient;
    setIngredient(""); // Clear input field immediately

    // Optimistically update UI
    const optimisticIngredients = [...ingredients, newIngredient];
    setIngredients(optimisticIngredients);

    try {
      setError(null);

      const { data: currentData, error: fetchError } = await supabase
        .from('ingredients')
        .select('stuff')
        .eq('email', user.email)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('ingredients')
            .insert({ email: user.email, stuff: [newIngredient] });

          if (insertError) {
            setIngredients(ingredients);
            setError(`Error creating record: ${insertError.message}`);
          }
        } else {
          setIngredients(ingredients);
          setError(`Error fetching current data: ${fetchError.message}`);
        }
      } else {
        const updatedIngredients = [...(currentData?.stuff || []), newIngredient];

        const { error: updateError } = await supabase
          .from('ingredients')
          .update({ stuff: updatedIngredients })
          .eq('email', user.email);

        if (updateError) {
          setIngredients(ingredients);
          setError(`Error updating record: ${updateError.message}`);
        }
      }
    } catch (err) {
      setIngredients(ingredients);
      setError('An unexpected error occurred');
    }
  }, [ingredient, user?.email, ingredients]);

  // Delete a specific ingredient with optimistic UI update
  const handleDeleteIngredient = useCallback(async (indexToDelete) => {
    if (!user?.email) return;

    const originalIngredients = [...ingredients];
    const updatedIngredients = ingredients.filter((_, index) => index !== indexToDelete);
    setIngredients(updatedIngredients);

    try {
      setError(null);

      const { error } = await supabase
        .from('ingredients')
        .update({ stuff: updatedIngredients })
        .eq('email', user.email);

      if (error) {
        setIngredients(originalIngredients);
        setError(`Error updating record: ${error.message}`);
      }
    } catch (err) {
      setIngredients(originalIngredients);
      setError('An unexpected error occurred');
    }
  }, [user?.email, ingredients]);

  return {
    ingredient,
    setIngredient,
    ingredients,
    isLoading,
    error,
    handleAddIngredient,
    handleDeleteIngredient,
  };
}
