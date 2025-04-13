const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const DrinkRecommendation = require('./model/DrinkRecomendation');
const Ingredient = require('./model/Ingredient');

const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro"];
const promptTemplate = `Generate a list of drink recommendations.           
                        You must return a maximum of @DRINK_AMOUNT@ drink recommendations.
                        You must ONLY use these ingredients in your drink recommendations.
                        If you do not have enough ingredients to make a drink 
                        recommendation please return an empty array.
                        If you have several ingredients, try to make multiple drink recommendations
                        that use different ingredients than the ones already used in previous recommendations.
                        Try to give the names of actual cocktails rather than just the name of the ingredients.
                        Try to use realistic quantities for the ingredients. 
                        For example, cocktails that are mostly liquor should typically total around 4-5 oz, 
                        while other drinks like highballs or mocktails should total around 8-10 oz. 
                        Ensure the quantities make sense for the type of drink being recommended.
                        Try to create fun names for your drink recomendations and make them sound appealing.
                        @DRINK_TYPE@
                        Here is the list of ingredients you can use:`;

// Flexible version – you may add common bar staples
const promptTemplateFlexible = `Generate a list of drink recommendations.
You must return a maximum of @DRINK_AMOUNT@ drink recommendations.
You may use the ingredients provided below **and** any common bar staples (e.g., citrus, simple syrup, bitters, soda) if they improve the drink.
Avoid exotic or hard to find items unless they’re already in the list.
If you still can’t make a drink, return an empty array.
@DRINK_TYPE@
Primary ingredients:`;

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
     * @param {boolean} fakeData - If true, returns mock data instead of calling the API. (Required)
     * @param {string[]} ingredients - List of ingredients to use for drink recommendations.
     * @param {string} type - The type of drink recommendations to generate ('cocktail' or 'mocktail'). (Required)
     * @param {number} amount - The maximum number of drink recommendations to generate. (Required)
     * @returns {Promise<DrinkRecommendation[]>} A promise that resolves to an array of drink recommendations.
     * @throws {Error} If any required parameter is missing or invalid.
     */
    async getRecommendations(fakeData, ingredients, type, amount, allowExtras = false) {
        if (fakeData) {
            // Example data
            const recommendations = [
                new DrinkRecommendation(
                    'Mojito',
                    [
                        new Ingredient('Mint Leaves', '10 leaves'),
                        new Ingredient('White Rum', '50ml'),
                        new Ingredient('Sugar Syrup', '15ml'),
                        new Ingredient('Lime Juice', '25ml'),
                        new Ingredient('Soda Water', 'Top up'),
                    ],
                    'Muddle mint leaves with sugar syrup and lime juice. Add rum and ice, then top up with soda water.'
                ),
                new DrinkRecommendation(
                    'Old Fashioned',
                    [
                        new Ingredient('Bourbon', '50ml'),
                        new Ingredient('Sugar Cube', '1 cube'),
                        new Ingredient('Angostura Bitters', '2 dashes'),
                        new Ingredient('Orange Peel', '1 twist'),
                    ],
                    'Muddle sugar cube with bitters. Add bourbon and ice, then stir. Garnish with orange peel.'
                ),
            ];
            return recommendations;
        }
        else {
            if (fakeData === undefined || type === undefined || amount === undefined) {
                throw new Error("Missing required parameters: fakeData, type, and amount are required.");
            }
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const ingredientList = ingredients.join(', ');
                let typeOfRecomendation;
                if (type === 'cocktail') {
                    typeOfRecomendation = 'Please provide only cocktail and mixed drink recommendations.';
                }
                else if (type === 'mocktail') {
                    typeOfRecomendation = 'Please provide only mocktail drink recommendations.';
                }
                else {
                    throw new Error('Invalid type. Please specify either "cocktail" or "mocktail".');
                }

                // Rule that tells gemini whether it can add extra ingredients
                const template = allowExtras ? promptTemplateFlexible : promptTemplate;
                const fullPrompt = `${template
                    .replace('@DRINK_TYPE@', typeOfRecomendation)
                    .replace('@DRINK_AMOUNT@', amount)}
                                    \n${ingredientList}`;
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
}

export default DrinkRecommendationService;
