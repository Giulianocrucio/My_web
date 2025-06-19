import { rocketBodies } from './rocket.js';

// Matter.js modules
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;


// Render options
let WIDTH = 1200
let HIGH = 600

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
        showAngleIndicator: true
    }
});

// Create ground
const ground = Bodies.rectangle(WIDTH / 2, HIGH - 20, WIDTH, 40, { 
    isStatic: true,
    render: {
        fillStyle: '#4a4a6a'
    }
});


// Add ground and walls to world
World.add(world, ground);

// Function to add a new box
function addBox() {
    if (Math.random() < 0.25){
    const x = Math.random() * 600 + 100;
    const box = Bodies.rectangle(x, 50, 
        Math.random() * 40 + 30, 
        Math.random() * 40 + 30, {
        render: {
            fillStyle: `hsl(${Math.random() * 360}, 70%, 60%)`
        },
        restitution: Math.random() * 0.8 + 0.2,
        friction: Math.random() * 0.3
    });
    World.add(world, box);
    }
    else{
        const rocket = new rocketBodies();
        World.add(world, rocket.box);
    }
}


// Function to reset the simulation
function reset() {
    World.clear(world);
    Engine.clear(engine);
    
    // Re-add ground and walls
    World.add(world, [ground, leftWall, rightWall]);
    
    // Add initial box
    const newBox = Bodies.rectangle(400, 50, 60, 60, {
        render: {
            fillStyle: '#e74c3c'
        },
        restitution: 0.6,
        friction: 0.1
    });
    World.add(world, newBox);
}



const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

// Run the renderer
Render.run(render);

// Add some gravity variation for fun
engine.world.gravity.y = 1;

// Keep the mouse in sync with rendering

window.addBox = addBox;
window.reset = reset;