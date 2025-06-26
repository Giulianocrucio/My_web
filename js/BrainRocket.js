/*

*/

// Neural Network: 5 inputs -> 2 hidden layers (64 neurons each, ReLU) -> 3 outputs [0,1]
// Requires TensorFlow.js to be loaded globally

export class NeuralNetwork {
    constructor() {
        if (typeof tf === 'undefined') {
            throw new Error('TensorFlow.js not found in global scope. Make sure to load tf.min.js first.');
        }
        this.model = null;
        this.isCompiled = false;
    }

    // Create the neural network model
    createModel() {
        this.model = tf.sequential({
            layers: [
                // Input layer (5 inputs) -> First hidden layer (64 neurons)
                tf.layers.dense({
                    inputShape: [5],
                    units: 64,
                    activation: 'relu',
                    name: 'hidden_layer_1'
                }),
                
                // First hidden layer -> Second hidden layer (64 neurons)
                tf.layers.dense({
                    units: 64,
                    activation: 'relu',
                    name: 'hidden_layer_2'
                }),
                
                // Second hidden layer -> Output layer (3 outputs)
                // Using sigmoid activation to ensure outputs are in [0,1]
                tf.layers.dense({
                    units: 3,
                    activation: 'sigmoid',
                    name: 'output_layer'
                })
            ]
        });

        return this.model;
    }


    // Make predictions
    predict(inputData) {
        if (!this.model || !this.isCompiled) {
            throw new Error('Model must be created and compiled before prediction');
        }

        let inputTensor;
        let shouldDispose = true;

        // Handle different input formats
        if (tf.isTensor(inputData)) {
            inputTensor = inputData;
            shouldDispose = false;
        } else if (Array.isArray(inputData)) {
            if (inputData.length === 5 && typeof inputData[0] === 'number') {
                // Single prediction: [1, 2, 3, 4, 5]
                inputTensor = tf.tensor2d([inputData]);
            } else {
                // Batch prediction: [[1,2,3,4,5], [6,7,8,9,10]]
                inputTensor = tf.tensor2d(inputData);
            }
        } else {
            throw new Error('Input must be an array or tensor');
        }

        const prediction = this.model.predict(inputTensor);
        const result = prediction.dataSync();

        // Clean up tensors
        if (shouldDispose) inputTensor.dispose();
        prediction.dispose();

        // Return as array of arrays for batch predictions, or single array for single prediction
        if (inputData.length === 5 && typeof inputData[0] === 'number') {
            return Array.from(result);
        } else {
            const batchSize = inputTensor.shape[0];
            const results = [];
            for (let i = 0; i < batchSize; i++) {
                results.push(Array.from(result.slice(i * 3, (i + 1) * 3)));
            }
            return results;
        }
    }



    // Get model info
    getModelInfo() {
        if (!this.model) return null;
        
        return {
            inputShape: this.model.inputShape,
            outputShape: this.model.outputShape,
            layers: this.model.layers.length,
            parameters: this.model.countParams(),
            compiled: this.isCompiled
        };
    }

    // Save model
    async saveModel(savePath = '..\data\local_data\models') {
        if (!this.model) {
            throw new Error('No model to save');
        }
        await this.model.save(savePath);
        console.log(`Model saved to ${savePath}`);
    }

    // Load model
    async loadModel(loadPath) {
        this.model = await tf.loadLayersModel(loadPath);
        this.isCompiled = true;
        console.log(`Model loaded from ${loadPath}`);
        return this;
    }

    // Dispose model and free memory
    dispose() {
        if (this.model) {
            this.model.dispose();
            this.model = null;
            this.isCompiled = false;
            console.log('Model disposed and memory freed');
        }
    }
}



console.log('NeuralNetwork class loaded successfully!');
console.log('Usage: const nn = new NeuralNetwork(); nn.createModel().compileModel();');