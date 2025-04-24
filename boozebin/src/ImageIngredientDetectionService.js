const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const Ingredient = require('./model/Ingredient');

const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro"];

// Base prompt template
const basePromptTemplate = `
Analyze this image and identify all food and drink ingredients visible that could be used in cocktails or mocktails.

Very important: When identifying alcohol bottles or ingredients, include the specific brand name when visible (e.g., "Tito's Vodka" instead of just "Vodka", or "Hendrick's Gin" instead of just "Gin").

For each ingredient, provide:
1. The complete name of the ingredient including brand name when visible
2. The position of the ingredient in the image (bounding box coordinates)

Look specifically for:
- Spirits (vodka, gin, rum, tequila, whiskey, bourbon, etc.) with their brand names
- Liqueurs and cordials with brand names when possible
- Mixers (tonic water, soda, juices, etc.)
- Fresh fruits (lemon, lime, orange, berries, etc.)
- Herbs and garnishes (mint, basil, rosemary, etc.)
- Bitters, syrups, and other cocktail components
- Bar tools if present (shakers, jiggers, strainers)

Be precise and detailed with ingredient names, capturing the complete label text when possible. Avoid duplicates.
`;

const schema = {
    description: "List of ingredients detected in the image",
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            name: {
                type: SchemaType.STRING,
                description: "Name of the ingredient",
                nullable: false,
            },
            boundingBox: {
                type: SchemaType.OBJECT,
                description: "Position of the ingredient in the image",
                properties: {
                    x: {
                        type: SchemaType.NUMBER,
                        description: "X coordinate of the top-left corner (0-1 range)",
                        nullable: false,
                    },
                    y: {
                        type: SchemaType.NUMBER,
                        description: "Y coordinate of the top-left corner (0-1 range)",
                        nullable: false,
                    },
                    width: {
                        type: SchemaType.NUMBER,
                        description: "Width of the bounding box (0-1 range)",
                        nullable: false,
                    },
                    height: {
                        type: SchemaType.NUMBER,
                        description: "Height of the bounding box (0-1 range)",
                        nullable: false,
                    }
                },
                required: ["x", "y", "width", "height"],
                nullable: false,
            }
        },
        required: ["name", "boundingBox"],
    },
};

class ImageIngredientDetectionService {
    /**
     * Detects ingredients from an image
     * 
     * @param {string} imageData - Base64 encoded image data or image URL
     * @returns {Promise<Array<{name: string, boundingBox: {x: number, y: number, width: number, height: number}}>>} 
     *          A promise that resolves to an array of detected ingredients with bounding boxes
     * @throws {Error} If any required parameter is missing or invalid
     */
    async detectIngredients(imageData) {
        if (!imageData) {
            throw new Error("Image data is required");
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const fullPrompt = basePromptTemplate;

            // Try each model until one succeeds
            for (const modelName of models) {
                try {
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: schema,
                        },
                    });

                    // For base64 data that includes the data URL prefix
                    let imageContent;
                    if (imageData.startsWith('data:')) {
                        imageContent = {
                            inlineData: {
                                data: imageData.split(',')[1],
                                mimeType: imageData.split(';')[0].split(':')[1]
                            }
                        };
                    } else {
                        // For URLs or files
                        imageContent = { inlineData: { data: imageData } };
                    }

                    const result = await model.generateContent([fullPrompt, imageContent]);
                    
                    // Parse the JSON response
                    const ingredients = JSON.parse(result.response.text());
                    
                    return ingredients;
                } catch (error) {
                    console.warn(`Model ${modelName} failed, trying next model...`, error);
                }
            }
            throw new Error('All models failed to analyze the image.');
        } catch (error) {
            console.error('Error analyzing image:', error);
            throw error;
        }
    }
}

export default ImageIngredientDetectionService;
