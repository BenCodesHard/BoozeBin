class Ingredient {
    /**
     * @param {string} name - The name of the ingredient.
     * @param {string} quantity - The quantity of the ingredient.
     */
    constructor(name, quantity) {
        // Validate name is a string
        if (typeof name !== 'string') {
            throw new TypeError('Name must be a string');
        }
        
        // Validate quantity is a string
        if (typeof quantity !== 'string') {
            throw new TypeError('Quantity must be a string');
        }
        
        this.name = name;     // String: Ingredient Name
        this.quantity = quantity; // String: Ingredient Quantity
    }
}

module.exports = Ingredient;