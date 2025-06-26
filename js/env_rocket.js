import { rocketBodies,Particle } from './rocket.js';
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
let zoomLevel = 1;
const zoomStep = 0.1;

// Particle system manager
const particles = [];


function addParticles(x, y, direction, count = 5) {
    for (let i = 0; i < count; i++) {
        // Create particles in the specified direction
        const spread = 0.5 + (Math.random() ); // how much the particles spread
        const speed = Math.random() * 3 + 5;
        const angle = direction + (Math.random() - 0.5) * spread;
        
        const particle = new Particle(
            x + (Math.random() - 0.5) * 5, // small random offset
            y + (Math.random() - 0.5) * 5,
            Math.cos(angle) * speed, // in the direction specified
            Math.sin(angle) * speed,
            Math.random() * 30 + 30 // random lifetime
        );
        
        particles.push(particle);
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}

function renderParticles(context) {
    particles.forEach(particle => {
        particle.render(context);
    });
}


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
    particles.length = 0; // Clear particles
    initWorld();
}

function createRocket() {
    rocket = new rocketBodies(400, 20);
    rocketB = rocket.rk;

    // Set slop on all rocket parts
    rocketB.parts.forEach(part => {
        part.slop = 0.1;
    });

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
// used to undersand direction and points
function rendercentral() {
    if (!rocketB) return;
    
    const context = render.context;
    const halfHeight = 70;
    const halfwidth = 20;
    const offsetXh = -halfHeight * Math.sin(rocketB.angle);
    const offsetYh = halfHeight * Math.cos(rocketB.angle);
    const offsetXw = halfwidth * Math.sin(Math.PI / 2 - rocketB.angle)
    const offsetYw = halfwidth * Math.sin(rocketB.angle);
    
    const center = rocket.central_pos();

    // compute the "shift"
    const shift = (1*Math.PI / 2) ;

    // Get direction vector
    const direction = xyangle(rocketB.angle+shift);
    const length = 10; // Length of the vector
    
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
function renderleft() {
    if (!rocketB) return;
    
    const context = render.context;
    const center = rocket.left_pos();

    // compute the "shift"
    const shift = (1*Math.PI / 2) ;

    // Get direction vector
    const direction = xyangle(rocketB.angle+shift);
    const length = 10; // Length of the vector
    
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
function renderright() {
    if (!rocketB) return;
    
    const context = render.context;
    const center = rocket.right_pos();

    // compute the "shift"
    const shift = (1*Math.PI / 2) ;

    // Get direction vector
    const direction = xyangle(rocketB.angle+shift);
    const length = 10; // Length of the vector
    
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
    // rendercentral();
    // renderleft();
    // renderright();
    
    // Update and render particles
    updateParticles();
    renderParticles(render.context);
});

function logRocketAngle() {
    if (rocketB) {
        console.log('Rocket angle:', (rocketB.angle));
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
        
        // Add particles from central thruster
        const center = rocket.central_pos();
        const direction = rocketB.angle + Math.PI / 2;
        addParticles(center.x, center.y, direction, 3);
    }
    if (keys.a && rocket) {
        const forceMagnitude = 0.007; 
        rocket.left_force(forceMagnitude);
        
        // Add particles from left thruster
        const center = rocket.left_pos();
        const direction = rocketB.angle + Math.PI / 2;
        addParticles(center.x, center.y, direction, 2);
    }
    if (keys.d && rocket) {
        const forceMagnitude = 0.007;
        rocket.right_force(forceMagnitude);
        
        // Add particles from right thruster
        const center = rocket.right_pos();
        const direction = rocketB.angle + Math.PI / 2;
        addParticles(center.x, center.y, direction, 2);
    }
});

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

const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

// Run the renderer
Render.run(render);

// Add some gravity variation for fun
engine.world.gravity.y = 1;

initWorld();
window.addBox = addBox;
window.reset = reset;