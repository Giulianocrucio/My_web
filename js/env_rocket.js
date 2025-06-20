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
    rocket = new rocketBodies();
    rocketB = rocket.rk;
    World.add(world, rocketB);
}

function initWorld(){
    World.add(world, ground);
    createRocket();
}

function xyangle(angle) {
    return {
        x: Math.cos(angle),
        y: Math.sin(angle)
    };
}

// Function to render the direction vector
function renderDirectionVector() {
    if (!rocketB) return;
    
    const context = render.context;
    const center = {
        x: rocketB.position.x,
        y: rocketB.position.y
    };

    // compute the "shift"
    const shift = (5*Math.PI / 6) ;

    // Get direction vector
    const direction = xyangle(rocketB.angle + shift);
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
    if (rocketB) {
        console.log('Rocket angle:', xyangle(rocketB.angle));
        console.log('Rocket position:', { x: rocketB.position.x, y: rocketB.position.y });
    }
    requestAnimationFrame(logRocketAngle);
}
logRocketAngle();

const keys = {
    w: false,
    a: false,
    d: false
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
    if (keys.w && rocket) {
        const forceMagnitude = 0.007; 
        rocket.central_force(forceMagnitude);
    }
        if (keys.a && rocket) {
        const forceMagnitude = 0.007; 
        rocket.right_force(forceMagnitude);
    }
        if (keys.d && rocket) {
        const forceMagnitude = 0.007;; 
        rocket.left_force(forceMagnitude);
    }
});

function a() {
    console.log('A key pressed - move left');
}

function d() {
    console.log('D key pressed - move right');
}

const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

// Run the renderer
Render.run(render);

// Add some gravity variation for fun
engine.world.gravity.y = 1;

initWorld();
window.addBox = addBox;
window.reset = reset;