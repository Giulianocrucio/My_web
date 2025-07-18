import { rocketBodies } from './rocket.js';
import { sortIndeces } from './rocket.js';
import { UpdateBrains } from './rocket.js';



let rocketB;
let rocket;

// Matter.js modules
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;



// Render options
let WIDTH = 1200 ;
let HIGH = 550 ;
let zoomLevel = 0.2;
const zoomStep = 0.1;

// rockets options
let n_rocket = 100;
let n_parents = Math.floor(n_rocket*0.3);
let rockets = [];
let brains_rk;
let distanceFromRockets = 0;
let FromRocketToGround = 2500;
let x_generation = 2000;
let mutation_factor = 0.3;

// ground options
let grounds = [];
let only_ground;
let width_ground = 3000;
let high_ground = 50;
let scores = [];
// initializa the scores to -1
for(let i = 0; i< n_rocket; i++){
    scores.push(-1);
}
// save scores and best brains
let bestscore = -1 ;
let rocket_best_brain;
let score_chart = [];

// timer options
let time_scale = 1;
let timer_generation = 7; // in seconds
let timer_duration = timer_generation / time_scale; // in seconds
let n_gen = 1;
let timer;


// Create engine
const engine = Engine.create({
    positionIterations: 6, 
    velocityIterations: 4  
});
engine.timing.timeScale = time_scale;
const world = engine.world;

// Create renderer
const canvas = document.getElementById('canvas');
const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: WIDTH,
        height: HIGH,
        wireframes: false,
        background: '#16213e',
        showVelocity: true,
        showAngleIndicator: true,
        showVelocity: false,      // Disable for performance
        showAngleIndicator: false,// Disable for performance
        showCollisions: false,    // Disable collision highlights
        showBounds: false         // Disable bounds visualization
    }
});

function createGround(){
    // Create ground
    only_ground = Bodies.rectangle(x_generation, 50 + FromRocketToGround , width_ground, high_ground, { 
        isStatic: true,
        render: {
            fillStyle: '#4a4a6a'
        }
    });
    World.add(world, only_ground);
}

function createGrounds(){
    for(let i = 0; i < n_rocket; i++){
    const ground = Bodies.rectangle(x_generation + (distanceFromRockets * i), 50 + FromRocketToGround , width_ground , high_ground, { 
        isStatic: true,
        render: {
            fillStyle: '#4a4a6a'
            }
        });

    grounds.push(ground);
    World.add(world, ground);
    }
}



// Function to reset the simulation
function reset() {
    World.clear(world);
    Engine.clear(engine);
    initWorld();
}

function createRocket() {
    rocket = new rocketBodies(2000, 50);
    rocketB = rocket.rk;
    rocket.initializeBrain();
    World.add(world, rocketB);
}

function createRockets() {
    rockets = []; 
    for (let i = 0; i < n_rocket; i++) {
        const rocket = new rocketBodies(x_generation, 50);  
        rocket.initializeBrain();
        rocket.setHigh(FromRocketToGround + high_ground/2 );  

        
        // update new generation brains
        if(n_gen > 1){
            rocket.brain = brains_rk[i];
        }
        

        
            

        World.add(world, rocket.rk);
        rockets.push(rocket);

        Body.setAngle(rocket.rk, Math.PI/6 ); 
        Body.setVelocity(rocket.rk, { x: Math.random() * 2 - 1, y: 0 });
        Body.setAngularVelocity(rocket.rk, (Math.random())*0.0001 );
        // add noise
        if(n_gen > 1){
        // Body.setAngle(rocket.rk, Math.random() * Math.PI - Math.PI/2 ); // 180° range
        // Body.setVelocity(rocket.rk, { x: Math.random() * 2 - 1, y: 0 });
        // Body.setAngularVelocity(rocket.rk, (Math.random())*0.01 );
        }

        
    }
}

function initWorld(){



    // initialize scores
    for(let i = 0; i< n_rocket; i++){
        scores[i] = -1;
    }

    createGround();
    createRockets();
    

}


document.addEventListener("keydown", (event) => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    if (event.key === "i") {
        zoomLevel += zoomStep;
    } else if (event.key === "o") {
        zoomLevel = Math.max(zoomLevel - zoomStep, 0.1); // prevent negative or zero zoom
    }

    // Apply the transform directly to the rendering context
    if (event.key === "i" || event.key === "o") {
        context.setTransform(zoomLevel, 0, 0, zoomLevel, 0, 0);
    }
});

const keys = {
    i: false,
    o: false
};

document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = true;
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

let framesV = [0,0];


document.getElementById("n_rocket").textContent = `Number of rockets in the simulation: ${n_rocket}`;
document.getElementById("n_gen").textContent = `Generation number: ${n_gen}`;
canvas.getContext("2d").setTransform(zoomLevel, 0, 0, zoomLevel, 0, 0);;

const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

// Run the renderer
Render.run(render);

// Add some gravity variation for fun
engine.world.gravity.y = 1;

timer_duration = timer_duration*1000;
initWorld();


Events.on(engine, 'beforeUpdate', () => {
    if (keys.o) {
        console.log("zoom out");
    }
    if (keys.i) {
        console.log("zoom in");
    }

   for(let i = 0; i < n_rocket; i++){

    /*
    // debug NNs
    if(i == 0){
        console.log("input: ", rockets[i].getinput())
        console.log("forward pass: ", rockets[i].brain.forward(rockets[i].getinput()))
    }
    */
    
   
    // remember the velocity of frame before in case of colliding
    framesV[0] = framesV[1];
    framesV[1] = Math.abs(Body.getVelocity(rockets[i].rk).y);
    // console.log(framesV);

    rockets[i].think();

    if (Matter.Collision.collides(rockets[i].rk, only_ground) != null && scores[i] == -1) {
        // console.log("collision detected of rocket " + i);

        // get the score and freeze of the rockets
        scores[i] = rockets[i].getScore(framesV[0]);
        rockets[i].TuchedTheGround = true;

    }
   }


});
const ctx = document.getElementById('myChart').getContext('2d');

const chart = new Chart(ctx, {
type: 'line',
data: {
    labels: [], // timestamps
    datasets: [{
    label: 'Mean score of the best 5 rockets',
    data: [],
    borderColor: 'blue',
    borderWidth: 2,
    fill: false,
    }]
},
options: {
    responsive: false,
    animation: false,
    scales: {
    x: {
        title: { display: true, text: 'generation' }
    },
    y: {
        title: { display: true, text: 'Value' },
        suggestedMin: 0,
        suggestedMax: 0.5
    }
    }
}
});

function addMedianScoreData() {
    if (!scores || scores.length === 0) return;
    
    const average = array => array.reduce((a, b) => a + b) / array.length;
    const sorted = scores.toSorted().reverse();
    
    // Take top 5 scores (or all if fewer available)
    const topScores = sorted.slice(0, Math.min(5, sorted.length));
    
    const mean_score = average(topScores);
    // save
    score_chart.push(topScores);


    chart.data.labels.push(n_gen);
    chart.data.datasets[0].data.push(mean_score);
    
    
    chart.update();
}

window.timeScale = 1.0;
const slider = document.getElementById('timeScaleSlider');
const valueSpan = document.getElementById('timeScaleValue');
slider.addEventListener('input', function() {
    window.timeScale = parseFloat(slider.value);
    valueSpan.textContent = window.timeScale.toFixed(1);
    time_scale = window.timeScale;
    timer_duration = 1000*timer_generation / time_scale; // in seconds
    engine.timing.timeScale = time_scale;
    clearInterval(timer); // Clear previous timer
    start_timer();
});
function start_timer(){
    clearInterval(timer);
    timer = setInterval(async () => {

        n_gen = n_gen + 1;

        console.log("generation n: ", n_gen);
        /*
        get evaluation of performance

        mix the best models
            create n_rocket models

        load the new brains in the rockets

        restart the simulation

        */

        for(let i = 0; i < n_rocket; i++){

            // if it has not touched the ground yet
            if (scores[i] == -1) {
                scores[i] = rockets[i].getScore();
            }

            // save best performance rocket
            if(rockets[i].score > bestscore){

                rocket_best_brain = rockets[i];
            }
        
        // rockets[i].loadModel("data\local_data\models"); // to understand
        }

        rockets.push(rocket);
        scores.push(bestscore);
        
        brains_rk = await UpdateBrains(rockets, scores, n_parents, n_gen, mutation_factor);



        addMedianScoreData();
        


        console.log("max score: ", Math.max.apply(Math, scores));
        World.clear(world);
        Engine.clear(engine);
        initWorld();
        
        document.getElementById("n_gen").textContent = `Generation number: ${n_gen}`;

    }, timer_duration); 
}
start_timer();

// Mutation factor control
document.getElementById('setMutationFactorBtn').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('mutationFactorInput').value);
        mutation_factor = val;
});

// Number of rockets control
document.getElementById('setNumRocketsBtn').addEventListener('click', () => {
    const val = parseInt(document.getElementById('numRocketsInput').value, 10);
        n_rocket = val;
        n_parents = Math.floor(n_rocket * (save_percent / 100));
        // Reset scores array to match new n_rocket
        scores = [];
        for (let i = 0; i < n_rocket; i++) scores.push(-1);
        document.getElementById("n_rocket").textContent = `Number of rockets in the simulation: ${n_rocket}`;
        // Restart simulation to apply changes
        World.clear(world);
        Engine.clear(engine);
        initWorld();
});

// Percent to save control
let save_percent = 20; // default value
document.getElementById('setSavePercentBtn').addEventListener('click', () => {
    const val = parseInt(document.getElementById('savePercentInput').value, 10);
    if (val >= 0 && val <= 100) {
        save_percent = val;
        n_parents = Math.floor(n_rocket * (save_percent / 100));
    } else {
        alert('Percent to save must be between 0 and 100.');
    }
});
