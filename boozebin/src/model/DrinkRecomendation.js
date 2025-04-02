class DrinkRecommendation {
    /**
     * @param {string} drinkName - The name of the drink.
     * @param {Ingredient[]} ingredients - The list of ingredients required for the drink.
     * @param {string} instructions - The instructions to prepare the drink.
     */
    constructor(drinkName, ingredients, instructions) {
        // Validate drinkName is a string
        if (typeof drinkName !== 'string') {
            throw new TypeError('Drink name must be a string');
        }
        
        // Validate ingredients is an array
        if (!Array.isArray(ingredients)) {
            throw new TypeError('Ingredients must be an array');
        }
        
        // Validate instructions is a string
        if (typeof instructions !== 'string') {
            throw new TypeError('Instructions must be a string');
        }
        
        this.drinkName = drinkName; // String: Drink Name
        this.ingredients = ingredients; // Ingredient[]: Ingredients
        this.instructions = instructions; // String: Instructions
    }
}

module.exports = DrinkRecommendation;