

// Neural Network:  inputs ->  hidden layers (ReLU) -> 3 outputs [0,1]
export class NNs {
    constructor(layers = [5,16,32,16,3]) {
        // layers is an array representing the number of neurons in each layer
        // e.g., [3, 4, 2] means 3 input neurons, 4 hidden neurons, 2 output neurons
        this.layers = layers;
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

                    // Xavier initialization
                    const limit = 10*Math.sqrt(6 / (inputSize + outputSize));
                    const weighttoadd = (Math.random() * 2 * limit - limit) * 4;

                    row.push(weighttoadd);

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

    randn() {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
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
    
    saveModelToLocalStorage(key = "my_nn_model") {
        const modelData = {
            layers: this.layers,
            weights: this.extractWeights()
        };
        localStorage.setItem(key, JSON.stringify(modelData));
    }

    loadModelFromLocalStorage(key = "my_nn_model") {
        const jsonData = localStorage.getItem(key);
        if (!jsonData) throw new Error("No model found in localStorage");
        const modelData = JSON.parse(jsonData);
        if (!Array.isArray(modelData.layers) || !Array.isArray(modelData.weights)) {
            throw new Error('Invalid model format');
        }
        this.layers = modelData.layers;
        this.createNetwork();
        this.loadWeights(modelData.weights);
    }

    saveModelToFile(filename = "model.json") {
        const modelData = {
            layers: this.brain.layers,
            weights: this.brain.extractWeights()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(modelData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", filename);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
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
                    newActivations.push(Math.tanh(sum));
                } else {
                    // Use ReLU for hidden layers
                    newActivations.push(Math.max(0,sum));
                    
                }
            }
            
            activations = newActivations;
        }
        
        
        // output 0 or 1
        for(let i = 0; i < activations.length; i++ ){
          if(activations[i] >= 0){
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


// Usage example:

// Create a neural network
//  const nn = new NNs();

// Print network info
// nn.printNetworkInfo();

// Extract current weights
// const currentWeights = nn.extractWeights();
// console.log('Current weights:', currentWeights.length);

// Save weights to file (Node.js only)
//nn.saveWeights('./my_weights.json');

// Load weights from file (Node.js only)
//nn.loadWeights(nn.getWeights('./my_weights.json'));
// nn.printNetworkInfo();
// nn.loadWeights(currentWeights);


/*
// Test forward pass
for(let i = 0; i<100; i++){
    let row = [];
    for(let j = 0; j<5;j++){
        row.push(Math.random()*2 - 1);
    }
    //console.log((row));
    console.log(nn.forward(row));
}
*/
// nn.printNetworkInfo();

// extract a weght from 0 to N-1
function rnd_n(N){
    return Math.floor(Math.random() * N);
}
function rouletteWheelSelect(scores) {
  if (!Array.isArray(scores) || scores.length === 0) {
    throw new Error("scores must be a non-empty array");
  }

  // 1. Find minimum score
  const minScore = Math.min(...scores);

  // 2. Shift all scores upward so that the minimum becomes slightly above 0
  //    We add ε = 1e-6 to avoid zero total weight if all scores equal.
  const epsilon = 1e-6;
  const shifted = scores.map(s => s - minScore + epsilon);

  // 3. Compute the cumulative sum array
  const cumSum = [];
  let total = 0;
  for (let w of shifted) {
    total += w;
    cumSum.push(total);
  }

  // 4. Pick a uniform random number in [0, total)
  const r = Math.random() * total;

  // 5. Find first index where cumSum[i] > r
  //    This is O(n); for large n you could binary-search.
  for (let i = 0; i < cumSum.length; i++) {
    if (r < cumSum[i]) {
      return i;
    }
  }

  // 6. (Numerical edge) fallback to last index
  return scores.length - 1;
}

export async function mixBrains(brains_parents, scores, n_child, mutationFactor,n_gen){

    const n_parents = brains_parents.length;

    /*
        get the vectors

        mix the vectors 

        compute mutation
    */

    let vector_weight_parent = [];
    let vector_weight_child = [];
    let brains_children = [];

    // get the vectors
    for(let i = 0; i < n_parents; i++){
        vector_weight_parent.push(brains_parents[i].extractWeights())
    }


    // mix the vectors 
    for(let k = 0; k < n_child ; k++){

        let weights_child = new Array(vector_weight_parent[0].length);


        // select two random parents
        const randomParents = [ vector_weight_parent[rouletteWheelSelect(scores)],
                                vector_weight_parent[rouletteWheelSelect(scores)]];

        for(let i = 0; i<vector_weight_parent[0].length; i++){
            weights_child[i] = randomParents[rnd_n(2)][i];
        }
        vector_weight_child.push(weights_child)
    }

   
    // compute mutation
    for(let k = 0; k<n_child ; k++){

        const mutation_per_child = ((Math.random()*0.5)+0.5)*mutationFactor;

        for(let i = 0; i<vector_weight_parent[0].length; i++){
            
            // uniformly choosen in [-mutationFactor, mutationFactor]
            vector_weight_child[k][i] += (Math.random() * 2 -1) * mutation_per_child;

        }

        // load brains
        const new_brain = new NNs(brains_parents[0].layers);
        new_brain.loadWeights(vector_weight_child[k]);

        brains_children.push(new_brain);
    }
    return brains_children;
}

