import { rocketBodies } from './rocket.js';
import { sortIndeces } from './rocket.js';



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
let rockets = [];
let distanceFromRockets = 1000;
let FromRocketToGround = 2500;

let grounds = [];
let width_ground = 500;
let high_ground = 50;
let scores = [];
// initializa the scores to -inf
for(let i = 0; i< n_rocket; i++){
    scores.push(-1000);
}

// timer options
let timer_duration = 8; // in seconds
let n_gen = 1;

// Create engine
const engine = Engine.create({
    positionIterations: 6, 
    velocityIterations: 4  
});
engine.timing.timeScale = 1;
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

// Create ground
const ground = Bodies.rectangle(WIDTH / 2, HIGH - 20, WIDTH, 40, { 
    isStatic: true,
    render: {
        fillStyle: '#4a4a6a'
    }
});

function createGrounds(){
    for(let i = 0; i < n_rocket; i++){
    const ground = Bodies.rectangle(300 + (distanceFromRockets * i), 50 + FromRocketToGround , width_ground , high_ground, { 
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
        const rocket = new rocketBodies(300 + (distanceFromRockets * i), 50);  
        rocket.initializeBrain();
        rocket.setHigh(FromRocketToGround + high_ground/2 );  
        Body.setAngle(rocket.rk, Math.random() * Math.PI - Math.PI/2 ); // 180° range
        World.add(world, rocket.rk);
        rockets.push(rocket);
    }
}

function initWorld(){
    createGrounds();
    createRockets();
    
    // initialize scores
    for(let i = 0; i< n_rocket; i++){
        scores[i] = -1000;
    }
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
Events.on(engine, 'beforeUpdate', () => {
    if (keys.o) {
        console.log("zoom out");
    }
    if (keys.i) {
        console.log("zoom in");
    }

   for(let i = 0; i < n_rocket; i++){

    // remember the velocity of frame before in case of colliding
    framesV[0] = framesV[1];
    framesV[1] = Body.getSpeed(rockets[i].rk);
   
    rockets[i].think();
    if (Matter.Collision.collides(rockets[i].rk, grounds[i]) != null && scores[i] == -1000) {
        console.log("collision detected of rocket " + i)

        // get the score and freeze of the rockets
        scores[i] = rockets[i].getScore(framesV[0]);
    }
   }


});

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
const timer = setInterval(() => {

        /*
        get evaluation of performance

        mix the best models
            create n_rocket models

        load the new brains in the rockets

        restart the simulation

        */

        for(let i = 0; i < n_rocket; i++){

            // if it has not touched the ground yet
            if (scores[i] == -1000) {
                scores[i] = rockets[i].getScore();
            }
        
        console.log(rockets[i].getScore());
        // rockets[i].loadModel("data\local_data\models"); // to understand
        }
        console.log("scores:")
        console.log(scores);
        // get the indices of the sorted scores
        console.log("indices of best scores:")
        const IndicesSorted = sortIndeces(scores);
        console.log(IndicesSorted);

        World.clear(world);
        Engine.clear(engine);
        initWorld();

        n_gen = n_gen + 1;
        document.getElementById("n_gen").textContent = `Generation number: ${n_gen}`;

    }, timer_duration); 
