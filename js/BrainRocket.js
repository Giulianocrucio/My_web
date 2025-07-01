

// Neural Network: 5 inputs -> 2 hidden layers (64 neurons each, ReLU) -> 3 outputs [0,1]
// 5 input: a tf.isTensor(inputData)
// inputData: anglex, angley, angularvelocity, positionx, positionty

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
    predict(inputTensor) {
        if (!this.model || !this.isCompiled) {
            throw new Error('Model must be created and compiled before prediction');
        }

        // Direct prediction with the tensor - no type checking needed
        const prediction = this.model.predict(inputTensor);
        const result = prediction.dataSync();
        
        // Clean up the prediction tensor
        prediction.dispose();
        
        // Return as simple array [output1, output2, output3]
        return Array.from(result);
    }

    compileModel() {
        if (!this.model) {
            throw new Error('Model must be created before compilation');
        }
        
        this.model.compile({
            optimizer: 'adam',
            loss: 'meanSquaredError',
            metrics: ['accuracy']
        });
        
        this.isCompiled = true;
        return this;
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

    /*
    // Save model
    async saveModel(savePath = '../data/local_data/models') {
        if (!this.model) {
            throw new Error('No model to save');
        }
        await this.model.save(savePath);
        console.log(`Model saved to ${savePath}`);
    }
    */

    async saveModel(modelName = 'model', savePath = '../data/local_data/models' ) {
        if (!this.model) {
            throw new Error('No model to save');
        }
        
        const fullPath = `${savePath}/${modelName}`;
        await this.model.save(`${fullPath}`);
        console.log(`Model saved to ${fullPath}`);
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