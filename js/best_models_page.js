import { rocketBodies } from './rocket.js';
import { Particle } from './rocket.js';


// Matter.js modules
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;

// options
 
let brain_weights = [];
const filePaths = [
    '../data/models/best.txt',
    '../data/models/best3.txt',
    '../data/models/best4.txt'
    ];
let n_rocket = filePaths.length;

// Render options
let WIDTH = 1200 ;
let HIGH = 550 ;
let zoomLevel = 0.2;
const zoomStep = 0.1;

// rockets options
let rockets = [];
let FromRocketToGround = 2500;
let x_generation = 3000;


// ground options
let only_ground;
let width_ground = 5000;
let high_ground = 50;
let scores = [];

// timer options
let time_scale = 1;
let timer_generation = 9; // in seconds
let timer_duration = timer_generation / time_scale; // in seconds
let timer;

// Particle system manager
const particles = [];


function addParticles(x, y, direction, count = 100) {
    let realcount = count*time_scale;
    for (let i = 0; i < realcount; i++) {
        // Create particles in the specified direction
        let spread = 0.2 + (Math.random() ); // how much the particles spread
        let speed = Math.random() * 5 + 10;
        speed = speed*time_scale;
        spread = spread/time_scale;
        const angle = direction + (Math.random() - 0.5) * spread;
        
        const particle = new Particle(
            x + (Math.random() - 0.5) * 5, // small random offset
            y + (Math.random() - 0.5) * 5,
            Math.cos(angle) * speed, // in the direction specified
            Math.sin(angle) * speed,
            Math.random() * 30 + 50 // random lifetime
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


async function loadweights() {
    for(let i = 0; i < n_rocket; i++){
    try {
        const response = await fetch(filePaths[i]);
        const text = await response.text();
        brain_weights.push(JSON.parse(text));
    } catch (err) {
        console.error('Failed to load or parse the file:', err);
    }
    }
}

await loadweights();

function createRockets() {
    rockets = []; 
    for (let i = 0; i < n_rocket; i++) {
        const rocket = new rocketBodies(x_generation, 50);  
        rocket.initializeBrain();
        /*
        load best models brains
        */
        rocket.brain.loadWeights(brain_weights[i]);
        console.log("model loaded");
        rocket.setHigh(FromRocketToGround + high_ground/2 );  

        World.add(world, rocket.rk);
        rockets.push(rocket);

        Body.setVelocity(rocket.rk, { x: Math.random()*0.05 - 0.025, y:0 });
        Body.setAngle(rocket.rk, Math.PI/6 - 0.01); 

        
    }
}

function initWorld(){

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

document.getElementById("n_rocket").textContent = `Number of rockets in the simulation: ${n_rocket}`;
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
    const rocket = rockets[i];
    if (!rocket.TuchedTheGround) {
        rocket.think();
    }
    // console.log(rockets[i].getoutput());
    if (Matter.Collision.collides(rockets[i].rk, only_ground) 
        &&  !rockets[i].TuchedTheGround ) {
        console.log("collision detected of rocket " + i);

        //freeze of the rockets
        rockets[i].hasTuchedTheGround();
        console.log(rockets[i].TuchedTheGround);

    }
   }
   

});


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
        World.clear(world);
        Engine.clear(engine);
        initWorld();

    }, timer_duration); 
}
start_timer();

// Add the vector rendering to the afterRender event
Events.on(render, 'afterRender', function() {
    
    // Update and render particles
    updateParticles();
    renderParticles(render.context);
});

Events.on(engine, 'beforeUpdate', () => {
    for (let i = 0; i < n_rocket; i++) {
        
        const rocket = rockets[i];
        if(!rocket.TuchedTheGround){
            const out = rocket.getoutput()
            if (out[0]>0) {

                // Add particles from central thruster
                const center = rocket.central_pos();
                const direction = rocket.rk.angle + Math.PI / 2;
                addParticles(center.x, center.y, direction, 3);
            }
            if (out[1]>0) {

                // Add particles from left thruster
                const center = rocket.left_pos();
                const direction = rocket.rk.angle + Math.PI / 2;
                addParticles(center.x, center.y, direction, 2);
            }
            if (out[2]>0) {
                // Add particles from right thruster
                const center = rocket.right_pos();
                const direction = rocket.rk.angle + Math.PI / 2;
                addParticles(center.x, center.y, direction, 2);
        }
    }
}
});