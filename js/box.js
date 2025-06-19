// Matter.js modules
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;

// Create engine
const engine = Engine.create();
const world = engine.world;

// Create renderer
const canvas = document.getElementById('canvas');
const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#16213e',
        showVelocity: true,
        showAngleIndicator: true
    }
});

// Create ground
const ground = Bodies.rectangle(400, 580, 800, 40, { 
    isStatic: true,
    render: {
        fillStyle: '#4a4a6a'
    }
});

// Create walls
const leftWall = Bodies.rectangle(20, 300, 40, 600, { 
    isStatic: true,
    render: {
        fillStyle: '#4a4a6a'
    }
});
const rightWall = Bodies.rectangle(780, 300, 40, 600, { 
    isStatic: true,
    render: {
        fillStyle: '#4a4a6a'
    }
});

// Add ground and walls to world
World.add(world, [ground, leftWall, rightWall]);

// Create initial falling box
const initialBox = Bodies.rectangle(400, 50, 60, 60, {
    render: {
        fillStyle: '#e74c3c'
    },
    restitution: 0.6,
    friction: 0.1
});
World.add(world, initialBox);

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

// Function to add a new circle
function addCircle() {
    const x = Math.random() * 600 + 100;
    const circle = Bodies.circle(x, 50, Math.random() * 25 + 15, {
        render: {
            fillStyle: `hsl(${Math.random() * 360}, 70%, 60%)`
        },
        restitution: Math.random() * 0.9 + 0.1,
        friction: Math.random() * 0.3
    });
    World.add(world, circle);
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

// Function to get the count of boxes
function getBoxCount() {
    // Count only dynamic rectangles (boxes)
    return world.bodies.filter(b => 
        b.label === 'Rectangle Body' && !b.isStatic
    ).length;
}

// Function to report the box count to the server
// to learn get and save data in local about the simulation
function reportBoxCount() {
    const count = getBoxCount();
    fetch('http://localhost:3001/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
    }).catch(() => {});
}

// Call reportBoxCount every second
setInterval(reportBoxCount, 1000);

// Run the engine
Engine.run(engine);

// Run the renderer
Render.run(render);

// Add some gravity variation for fun
engine.world.gravity.y = 1;

// Optional: Add mouse interaction
const mouse = Matter.Mouse.create(canvas);
const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});
World.add(world, mouseConstraint);

// Keep the mouse in sync with rendering
render.mouse = mouse;

window.addBox = addBox;
window.addCircle = addCircle;
window.reset = reset;