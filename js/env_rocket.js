import { rocketBodies } from './rocket.js';
let rocket;

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


// Function to add a new box
function addBox() {
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


// Function to reset the simulation
function reset() {
    World.clear(world);
    Engine.clear(engine);
    initWorld();
}

function createRocket() {
    const box = new rocketBodies();
    rocket = box.rk;
    World.add(world, rocket);
}

function initWorld(){
    World.add(world, ground);
    createRocket();
}

function xyangle(angl){
    const x = Math.cos(angl);
    const y = Math.sin(angl);
    return { x, y };
}

// Function to render the direction vector
function renderDirectionVector() {
    if (!rocket) return;
    
    const context = render.context;
    const center = {
        x: rocket.position.x,
        y: rocket.position.y
    };

    // compute the "shift"
    const shift = Math.PI /4;

    // Get direction vector
    const direction = xyangle(rocket.angle + shift);
    const length = 80; // Length of the vector
    
    // Calculate end point
    const end = {
        x: center.x + direction.x * length,
        y: center.y + direction.y * length
    };
    
    // Save context state
    context.save();
    
    // Draw the vector line
    context.beginPath();
    context.moveTo(center.x, center.y);
    context.lineTo(end.x, end.y);
    context.lineWidth = 2;
    context.strokeStyle = 'blue';
    context.stroke();
    
    // Restore context state
    context.restore();
}

// Add the vector rendering to the afterRender event
Events.on(render, 'afterRender', function() {
    renderDirectionVector();
});

function logRocketAngle() {
    if (rocket) {
        console.log('Rocket angle:', xyangle(rocket.angle));
        console.log('Rocket position:', { x: rocket.position.x, y: rocket.position.y });
    }
    requestAnimationFrame(logRocketAngle);
}
logRocketAngle();

const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

// Run the renderer
Render.run(render);

// Add some gravity variation for fun
engine.world.gravity.y = 1;

initWorld();
window.addBox = addBox;
window.reset = reset;