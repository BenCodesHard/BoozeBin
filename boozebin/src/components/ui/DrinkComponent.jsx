    import React, { useState } from "react";
    import { Heart } from "lucide-react";
    import { Card } from "@heroui/react";
    import { ScrollShadow } from "@heroui/react";

    const DrinkRecommendation = ({ drinkRecommendation }) => {
    const [favorited, setFavorited] = useState(false);

    const toggleFavorite = () => setFavorited(!favorited);

    return (
        <Card className="relative bg-[#1a1a2e]/70 p-6 rounded-2xl shadow-md border border-[#2f2f4f] w-[100%] mx-auto">
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

    const DrinkRecommendationList = ({ drinkRecommendations }) => {
    return (
        <div className="flex flex-col gap-6 p-6 bg-[#0f0f1f] max-h-[650px] overflow-y-auto rounded-xl w-full items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {drinkRecommendations.map((drink, index) => (
            <DrinkRecommendation key={index} drinkRecommendation={drink} />
        ))}
        </div>
    );
    };

    export default DrinkRecommendationList;