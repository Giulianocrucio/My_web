import { rocketBodies } from './rocket.js';
import { NeuralNetwork } from './BrainRocket.js';


let brain = new NeuralNetwork();
brain.createModel();
brain.compileModel();

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
let HIGH = 600 ;
let zoomLevel = 0.2;
const zoomStep = 0.1;

// rockets options
let n_rocket = 10;
let rockets = [];
let distanceFromRockets = 1000;
let FromRocketToGround = 2500;

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
    const ground = Bodies.rectangle(300 + (distanceFromRockets * i), 50 + FromRocketToGround , 400 , 40, { 
        isStatic: true,
        render: {
            fillStyle: '#4a4a6a'
            }
        });
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
        rocket.setHigh(distanceFromRockets);  
        Body.setAngle(rocket.rk, Math.random() * Math.PI - Math.PI/2 ); // 180° range
        World.add(world, rocket.rk);
        rockets.push(rocket);
    }
}

function initWorld(){
    createGrounds();
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

Events.on(engine, 'beforeUpdate', () => {
    if (keys.o) {
        console.log("zoom out");
    }
    if (keys.i) {
        console.log("zoom in");
    }


    //////////////
    // test brain
    //////////////
    /*
    const forceMagnitude = 0.005;
    const pre = brain.predict(rocket.getinput());

    rocket.central_force(pre[0]*forceMagnitude);  // Use first output for central force
    //rocket.left_force(pre[1]*forceMagnitude);     // Use second output for left force  
    //rocket.right_force(pre[2]*forceMagnitude);    // Use third output for right force

    console.log(pre[1]);
    */


   //rocket.think();
   for(let i = 0; i < n_rocket; i++){
    rockets[i].think();
   }

});

canvas.getContext("2d").setTransform(zoomLevel, 0, 0, zoomLevel, 0, 0);;

const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

// Run the renderer
Render.run(render);

// Add some gravity variation for fun
engine.world.gravity.y = 1;

initWorld();
