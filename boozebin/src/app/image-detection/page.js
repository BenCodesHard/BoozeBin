'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AlertTriangle, Loader2 } from 'lucide-react';
import NavigationDropdown from '@/components/ui/NavigationDropdown';
import ImageUploader from '@/components/ui/ImageUploader';
import IngredientDetectionCanvas from '@/components/ui/IngredientDetectionCanvas';
import DetectedIngredientsList from '@/components/ui/DetectedIngredientsList';
import AlertNotification from '@/components/ui/AlertNotification';
import { useIngredients } from '@/components/useIngredients';
import ImageIngredientDetectionService from '@/ImageIngredientDetectionService';
import supabase from '@/supabaseClient';

const Page = () => {
  // User session state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Image detection states
  const [imageSrc, setImageSrc] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  
  // Alert notification state
  const [alert, setAlert] = useState({ show: false, message: "", type: "error" });

  // Check for user session on component mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
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

  // Setup useIngredients hook for adding ingredients to user's list
  const {
    ingredients,
    isLoading: isIngredientsLoading,
    error: ingredientsError,
    handleAddIngredient,
    setIngredient
  } = useIngredients(user);

  // Handle image selection
  const handleImageSelected = (imageSource) => {
    setImageSrc(imageSource);
    setDetectedIngredients([]);
    
    // Automatically analyze the image after selection
    analyzeImage(imageSource);
  };

  // Analyze the selected image with Gemini API
  const analyzeImage = async (imageSource) => {
    if (!imageSource) return;
    
    setIsAnalyzing(true);
    setAlert({ show: false, message: "", type: "error" });    try {
      const service = new ImageIngredientDetectionService();
      const results = await service.detectIngredients(imageSource);
      
      if (results && results.length > 0) {
        setDetectedIngredients(results);
      } else {
        setAlert({
          show: true,
          message: "No ingredients were detected in the image. Try another image or angle.",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAlert({
        show: true,
        message: `Error analyzing image: ${error.message}`,
        type: "error"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle removing an ingredient from the detected list
  const handleRemoveIngredient = (index) => {
    setDetectedIngredients(prev => prev.filter((_, i) => i !== index));
  };
  // Handle adding confirmed ingredients to user's ingredient list
  const handleConfirmIngredients = async (confirmedIngredients) => {
    if (!user) {
      setAlert({
        show: true, 
        message: "Please log in to add ingredients to your list", 
        type: "error"
      });
      return;
    }

    try {
      // Add each ingredient to the user's list
      for (const ingredient of confirmedIngredients) {
        // Instead of using the hook methods directly, use the separate addIngredient function
        await addIngredientToList(ingredient);
      }

      setAlert({
        show: true,
        message: `Successfully added ${confirmedIngredients.length} ingredient(s) to your list`,
        type: "success"
      });

      // Clear selections but keep the image and detections
      setTimeout(() => {
        setAlert({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.error("Error adding ingredients:", error);
      setAlert({
        show: true,
        message: `Error adding ingredients: ${error.message}`,
        type: "error"
      });
    }
  };

  // Helper function to add a single ingredient to Supabase
  const addIngredientToList = async (ingredientName) => {
    if (!user?.email) return;

    try {
      const { data: currentData, error: fetchError } = await supabase
        .from('ingredients')
        .select('stuff')
        .eq('email', user.email)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No record found, create a new one
          await supabase
            .from('ingredients')
            .insert({ email: user.email, stuff: [ingredientName] });
        } else {
          throw new Error(`Error fetching data: ${fetchError.message}`);
        }
      } else {
        // Update existing record
        const updatedIngredients = [...(currentData?.stuff || [])];
        
        // Only add the ingredient if it's not already in the list
        if (!updatedIngredients.includes(ingredientName)) {
          updatedIngredients.push(ingredientName);
          
          await supabase
            .from('ingredients')
            .update({ stuff: updatedIngredients })
            .eq('email', user.email);
        }
      }
    } catch (error) {
      console.error("Error in addIngredientToList:", error);
      throw error;
    }
  };

  // Log out the user
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center items-center">
      <Loader2 className="animate-spin text-purple-500 h-8 w-8" />
      <p className="text-white ml-2">Loading...</p>
    </div>
  );

  // Guest view (when not logged in)
  const GuestView = () => (
    <div className="flex flex-col gap-4 items-center justify-center">
      <Image
        src="/boozebinLogoTransparent.PNG"
        alt="Booze Bin logo"
        width={300}
        height={38}
        className="mb-4"
        priority
      />
      <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-md">
        <div className="flex items-center">
          <AlertTriangle className="text-yellow-500 mr-2" size={20} />
          <p className="text-white">
            Please log in to use the ingredient detection feature
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen font-[family-name:var(--font-geist-sans)]"
      style={{
        backgroundImage: 'url("/backgroundBooze.jpg")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="min-h-screen p-8 pb-20 sm:p-20 grid grid-rows-[auto_1fr_auto]">
        <NavigationDropdown
          onSignOut={handleSignOut}
          isLoggedIn={!!user}
        />

        <main className="flex flex-col gap-8 w-full max-w-5xl mx-auto my-8">
          {loading ? (
            <LoadingState />
          ) : user ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Image Ingredient Detection</h1>
                <p className="text-purple-300">
                  Upload an image to automatically detect ingredients for your cocktails
                </p>
              </div>

              <AlertNotification
                show={alert.show}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, show: false })}
              />

              <div className="bg-[#1a1a2e]/80 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Step 1: Select an Image</h2>
                <ImageUploader
                  onImageSelected={handleImageSelected}
                  isLoading={isAnalyzing}
                />
              </div>

              {imageSrc && (
                <div className="bg-[#1a1a2e]/80 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold text-white mb-4">Step 2: Review Detected Ingredients</h2>
                  
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center p-8">
                      <Loader2 className="animate-spin text-purple-500 h-8 w-8 mb-4" />
                      <p className="text-white">Analyzing image...</p>
                      <p className="text-purple-300 text-sm mt-2">This may take a few moments</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <IngredientDetectionCanvas 
                        imageSrc={imageSrc}
                        detectedIngredients={detectedIngredients}
                      />
                      
                      <DetectedIngredientsList
                        detectedIngredients={detectedIngredients}
                        onRemoveIngredient={handleRemoveIngredient}
                        onConfirmIngredients={handleConfirmIngredients}
                        isLoading={isIngredientsLoading}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <GuestView />
          )}
        </main>
      </div>
    </div>  );
};

export default Page;
