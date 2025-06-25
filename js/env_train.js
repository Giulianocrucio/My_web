import { rocketBodies } from './rocket.js';
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

// Create engine
const engine = Engine.create();
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
    }
});

// Create ground
const ground = Bodies.rectangle(WIDTH / 2, HIGH - 20, WIDTH, 40, { 
    isStatic: true,
    render: {
        fillStyle: '#4a4a6a'
    }
});



// Function to reset the simulation
function reset() {
    World.clear(world);
    Engine.clear(engine);
    initWorld();
}

function createRocket() {
    rocket = new rocketBodies(300, 50);
    rocketB = rocket.rk;
    World.add(world, rocketB);
}

function initWorld(){
    World.add(world, ground);
    createRocket();
    const forceMagnitude = 0.1; 
    const force = {
        x: forceMagnitude * Math.cos(Math.PI/4), // 45 degrees right
        y: -forceMagnitude * Math.sin(Math.PI/4)  // 45 degrees up 
    };
    
    // Apply force at a RANDOM point near the center of mass
    const maxOffset = 30; // Maximum offset distance from center
    const offset = { 
        x: (Math.random() * 2 - 1) * maxOffset, 
        y: (Math.random() * 2 - 1) * maxOffset  
    };
    
    Body.applyForce(rocketB, {
        x: rocketB.position.x + offset.x,
        y: rocketB.position.y + offset.y
    }, force);
}


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
    }
});

const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

// Run the renderer
Render.run(render);

// Add some gravity variation for fun
engine.world.gravity.y = 1;

initWorld();
window.reset = reset;
