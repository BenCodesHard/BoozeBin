const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const DrinkRecommendation = require('./model/DrinkRecomendation');
const Ingredient = require('./model/Ingredient');

const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro"];

// Base prompt template
const basePromptTemplate = `Generate a list of drink recommendations.

You must return a maximum of @DRINK_AMOUNT@ drink recommendations.

Use realistic and balanced quantities for the ingredients.
For example, cocktails that are mostly liquor should typically total around 4-5 oz,
while other drinks like highballs or mocktails should total around 8-10 oz, often with a larger proportion of mixer (like soda, juice, or tonic) compared to the base spirit.
Ensure the quantities make sense for the type of drink being recommended.

Try to give the names of actual cocktails rather than just the name of the ingredients.
Try to create fun names for your drink recommendations and make them sound appealing.

If you have several ingredients, try to make multiple drink recommendations
that use different ingredients than the ones already used in previous recommendations.

If you do not have enough ingredients to make a drink recommendation please return an empty array.
`;

const schema = {
    description: "List of drink recommendations",
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            name: {
                type: SchemaType.STRING,
                description: "Name of the drink",
                nullable: false,
            },
            ingredients: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: {
                            type: SchemaType.STRING,
                            description: "Name of the ingredient",
                            nullable: false,
                        },
                        quantity: {
                            type: SchemaType.STRING,
                            description: "Quantity of the ingredient",
                            nullable: false,
                        },
                    },
                    required: ["name", "quantity"],
                },
                nullable: false,
            },
            instructions: {
                type: SchemaType.STRING,
                description: "Preparation instructions",
                nullable: false,
            },
        },
        required: ["name", "ingredients", "instructions"],
    },
};

class DrinkRecommendationService {
    /**
     * Generates drink recommendations based on the provided ingredients and type.
     * 
     * @param {string[]} ingredients - List of ingredients to use for drink recommendations.
     * @param {string} type - The type of drink recommendations to generate ('cocktail' or 'mocktail'). (Required)
     * @param {number} amount - The maximum number of drink recommendations to generate. (Required)
     * @param {boolean} allowExtras - Whether common bar staples can be added. Defaults to false.
     * @returns {Promise<DrinkRecommendation[]>} A promise that resolves to an array of drink recommendations.
     * @throws {Error} If any required parameter is missing or invalid.
     */    async getRecommendations(ingredients, type, amount, allowExtras = false) {
        if (type === undefined || amount === undefined) {
            throw new Error("Missing required parameters: type and amount are required.");
        }
        try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const ingredientList = ingredients.join(', ');
                let prompt = basePromptTemplate.replace('@DRINK_AMOUNT@', amount);

                // Add type-specific instructions
                if (type === 'cocktail') {
                    prompt += '\nPlease provide only cocktail and mixed drink recommendations.\n';
                } else if (type === 'mocktail') {
                    prompt += '\nPlease provide only mocktail drink recommendations.\n';
                } else {
                    throw new Error('Invalid type. Please specify either "cocktail" or "mocktail".');
                }

                // Add ingredient instructions based on allowExtras
                if (allowExtras) {
                    prompt += '\nYou may use the ingredients provided below **and** any common bar staples (e.g., citrus, simple syrup, bitters, soda) if they improve the drink. Avoid exotic or hard to find items unless they’re already in the list.\n';
                    prompt += `\nPrimary ingredients:\n${ingredientList}`;
                } else {
                    prompt += '\nYou must ONLY use these ingredients in your drink recommendations.\n';
                    prompt += `\nHere is the list of ingredients you can use:\n${ingredientList}`;
                }

                const fullPrompt = prompt;

                /*
                Due to rate limiting and other issues, this loop tries multiple models to generate the drink recommendations.
                It will try each model in the `models` array until one succeeds or all fail.
                */
                for (const modelName of models) {
                    try {
                        const model = genAI.getGenerativeModel({
                            model: modelName,
                            generationConfig: {
                                responseMimeType: "application/json",
                                responseSchema: schema,
                            },
                        });

                        const result = await model.generateContent(fullPrompt);

                        // Parse the JSON response into an array of drink objects
                        const drinksData = JSON.parse(result.response.text());

                        // Transform the data into DrinkRecommendation objects
                        const drinkRecommendations = drinksData.map(drink => {
                            // Convert each ingredient to an Ingredient object
                            const ingredients = drink.ingredients.map(ing =>
                                new Ingredient(ing.name, ing.quantity)
                            );

                            // Create a new DrinkRecommendation object
                            return new DrinkRecommendation(
                                drink.name,
                                ingredients,
                                drink.instructions
                            );
                        });

                        return drinkRecommendations;
                    }
                    catch (error) {
                        console.warn(`Model ${modelName} failed, trying next model...`, error);
                    }
                }
                throw new Error('All models failed to generate drink recommendations.');
            }
            catch (error) {
                console.error('Error generating drink recommendations:', error);
                throw error;
            }
        }
}


export default DrinkRecommendationService;
