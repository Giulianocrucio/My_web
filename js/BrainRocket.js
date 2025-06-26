/*

*/

export class NeuralNetwork {
    constructor() {
        if (typeof tf === 'undefined') {
            throw new Error('TensorFlow.js not found in global scope');
        }
        this.model = null;
        // ... rest of your class
    }
    
    createModel() {
        this.model = tf.sequential({ // This will work
            // ... your model definition
        });
    }
}