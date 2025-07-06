

// Neural Network: 5 inputs -> 2 hidden layers (64 neurons each, ReLU) -> 3 outputs [0,1]
export class NNs {
    constructor() {
        // layers is an array representing the number of neurons in each layer
        // e.g., [3, 4, 2] means 3 input neurons, 4 hidden neurons, 2 output neurons
        this.layers = [5,64,64,3];
        this.weights = [];
        this.biases = [];
        
        // Initialize weights and biases randomly
        this.createNetwork();
    }
    
    createNetwork() {
        // Create weights and biases for each layer connection
        for (let i = 0; i < this.layers.length - 1; i++) {
            const inputSize = this.layers[i];
            const outputSize = this.layers[i + 1];
            
            // Initialize weights matrix (inputSize x outputSize)
            const weightMatrix = [];
            for (let j = 0; j < inputSize; j++) {
                const row = [];
                for (let k = 0; k < outputSize; k++) {
                    // Random initialization between -1 and 1
                    row.push((Math.random() * 2) - 1);
                }
                weightMatrix.push(row);
            }
            this.weights.push(weightMatrix);
            
            // Initialize biases (one for each output neuron)
            const biasVector = [];
            for (let j = 0; j < outputSize; j++) {
                biasVector.push((Math.random() * 2) - 1);
            }
            this.biases.push(biasVector);
        }
    }
    
    // Helper function to convert matrix structure to flat array
    weightsToVector() {
        const vector = [];
        
        // Add all weights
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    vector.push(this.weights[i][j][k]);
                }
            }
        }
        
        // Add all biases
        for (let i = 0; i < this.biases.length; i++) {
            for (let j = 0; j < this.biases[i].length; j++) {
                vector.push(this.biases[i][j]);
            }
        }
        
        return vector;
    }
    
    // Helper function to convert flat array back to matrix structure
    vectorToWeights(vector) {
        let index = 0;
        const weights = [];
        const biases = [];
        
        // Reconstruct weights
        for (let i = 0; i < this.layers.length - 1; i++) {
            const inputSize = this.layers[i];
            const outputSize = this.layers[i + 1];
            
            const weightMatrix = [];
            for (let j = 0; j < inputSize; j++) {
                const row = [];
                for (let k = 0; k < outputSize; k++) {
                    row.push(vector[index++]);
                }
                weightMatrix.push(row);
            }
            weights.push(weightMatrix);
        }
        
        // Reconstruct biases
        for (let i = 0; i < this.layers.length - 1; i++) {
            const outputSize = this.layers[i + 1];
            const biasVector = [];
            for (let j = 0; j < outputSize; j++) {
                biasVector.push(vector[index++]);
            }
            biases.push(biasVector);
        }
        
        return { weights, biases };
    }
    
    extractWeights() {
        // Return weights and biases as a single flat array
        return this.weightsToVector();
    }
    
    loadWeights(weightsVector) {
        // Load weights from a flat array
        if (!Array.isArray(weightsVector)) {
            throw new Error('Weights must be provided as an array');
        }
        
        // Calculate expected size
        let expectedSize = 0;
        for (let i = 0; i < this.layers.length - 1; i++) {
            expectedSize += this.layers[i] * this.layers[i + 1]; // weights
            expectedSize += this.layers[i + 1]; // biases
        }
        
        if (weightsVector.length !== expectedSize) {
            throw new Error(`Expected ${expectedSize} weights, got ${weightsVector.length}`);
        }
        
        const { weights, biases } = this.vectorToWeights(weightsVector);
        this.weights = weights;
        this.biases = biases;
    }
    
    saveWeights(path) {
        // Save weights to a file (Node.js environment)
        const fs = require('fs');
        const weightsVector = this.extractWeights();
        
        try {
            const jsonData = JSON.stringify(weightsVector, null, 2);
            fs.writeFileSync(path, jsonData, 'utf8');
            console.log(`Weights saved to ${path}`);
        } catch (error) {
            throw new Error(`Failed to save weights: ${error.message}`);
        }
    }
    
    getWeights(path) {
        // Load weights from a file and return the flat array (Node.js environment)
        const fs = require('fs');
        
        try {
            const jsonData = fs.readFileSync(path, 'utf8');
            const weightsVector = JSON.parse(jsonData);
            console.log(`Weights loaded from ${path}`);
            return weightsVector;
        } catch (error) {
            throw new Error(`Failed to load weights: ${error.message}`);
        }
    }
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
    
    // Forward pass function 
    forward(inputs) {
        if (inputs.length !== this.layers[0]) {
            throw new Error('Input size does not match network input layer');
        }
        
        let activations = [...inputs];
        
        for (let i = 0; i < this.weights.length; i++) {
            const newActivations = [];
            const isOutputLayer = (i === this.weights.length - 1);
            
            for (let j = 0; j < this.weights[i][0].length; j++) {
                let sum = this.biases[i][j];
                for (let k = 0; k < activations.length; k++) {
                    sum += activations[k] * this.weights[i][k][j];
                }
                
                if (isOutputLayer) {
                    // Use linear for output layer
                    newActivations.push(this.sigmoid(sum));
                } else {
                    // Use ReLU for hidden layers
                    newActivations.push(Math.max(0, sum));
                }
            }
            
            activations = newActivations;
        }
        
        // output 0 or 1
        for(let i = 0; i < activations.length; i++ ){
          if(activations[i] >= 0.5){
            activations[i] = 1;
          }
          else{
            activations[i] = 0;
          }
        }
        return activations;
    }
    
    // Utility function to print network info
    printNetworkInfo() {
        console.log('Network Architecture:', this.layers);
        console.log('Number of features:', this.weightsToVector().length);
        for (let i = 0; i < this.weights.length; i++) {
            console.log(`Layer ${i + 1} weights shape: ${this.weights[i].length}x${this.weights[i][0].length}`);
        }
    }
}

/*
// Usage example:

// Create a neural network
const nn = new SimpleNeuralNetwork();

// Print network info
nn.printNetworkInfo();

// Extract current weights
const currentWeights = nn.extractWeights();
console.log('Current weights:', currentWeights);

// Save weights to file (Node.js only)
nn.saveWeights('./my_weights.json');

// Load weights from file (Node.js only)
nn.loadWeights(nn.getWeights('./my_weights.json'));
nn.printNetworkInfo();
nn.loadWeights(currentWeights);
nn.printNetworkInfo();

// Test forward pass
const output = nn.forward([0.5, 0.3, 0.8,1,1]);
console.log('Network output:', output);
*/