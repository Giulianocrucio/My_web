import { NeuralNetwork } from './BrainRocket.js';
// Matter.js modules
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;
const Constraint = Matter.Constraint;

let topwidth = 20;
let bottomwidth = 40;
let hhigh = 200;
let triangleHeight = 60;

let forceMagnitude = 0.005;

// calculate center of mass
let ycenter = centerofmass();

export class rocketBodies {
    constructor(x, y) {
        // to think
        this.brain;
        this.distanceGround = 300;

        // Create a trapezoid below the rectangle
        const width = bottomwidth;
        const height = hhigh;

        const trapezoidTopWidth = topwidth;   
        const trapezoidBottomWidth = bottomwidth;  
        const trapezoidHeight = 170;



        const shapeVertices = [
            { x: -trapezoidTopWidth/2, y: 0 },   // bottom left of triangle
            { x: trapezoidTopWidth/2, y: 0 },    // bottom right of triangle  
            { x: 0, y: -triangleHeight },        // top point of triangle
            // Trapezoid  - bottom
            { x: trapezoidBottomWidth/2, y: height },
            { x: -trapezoidBottomWidth/2, y: height}
        ];

        // optimize collision
        const collisionOptions = {
            collisionFilter: {
                group: -1,  // Negative group prevents self-collisions
                category: 2, // Category bitmask
                mask: 1     // Explicitly define what it collides with
            },
            render: { fillStyle: 'red' },
            chamfer: { radius: 5 },
            slop: 0.05,     // Helps with collision stability
            friction: 0.25,
            restitution: 0.4
        };

        // Create the trapezoid from custom vertices
        this.rk = Bodies.fromVertices(x, y, [shapeVertices], collisionOptions, true);
    }


    xyangle(angle) {
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    central_pos(){
        const offsetX = -(ycenter) * Math.sin(this.rk.angle);
        const offsetY =  (ycenter) * Math.cos(this.rk.angle);
        
        const pos = {
            x: this.rk.position.x + offsetX,
            y: this.rk.position.y + offsetY
        };
        return pos;
    }

    right_pos(){
        const central = this.central_pos();
        const offsetXr = (bottomwidth / 2) * Math.sin(Math.PI / 2 - this.rk.angle);
        const offsetYr = (bottomwidth/ 2) * Math.sin(this.rk.angle);
        const right = {
            x: central.x + offsetXr,
            y: central.y + offsetYr
        };
        return right;
    }

    left_pos(){
        const central = this.central_pos();
        const offsetXr = -(bottomwidth / 2) * Math.sin(Math.PI / 2 - this.rk.angle);
        const offsetYr = -(bottomwidth/ 2) * Math.sin(this.rk.angle);
        const left = {
            x: central.x + offsetXr,
            y: central.y + offsetYr
        };
        return left;
    }

    central_force(forceMagnitude) {
        const direction = this.xyangle(this.rk.angle - Math.PI / 2);
        const pos_centralF = this.central_pos();
        
        const forceVector = {
            x: direction.x * forceMagnitude,
            y: direction.y * forceMagnitude
        };
        
        Body.applyForce(this.rk, pos_centralF, forceVector);
    }

    right_force(forceMagnitude) {
        const direction = this.xyangle(this.rk.angle - Math.PI / 2);
        const right = this.right_pos();
        
        const forceVector = {
            x: direction.x * forceMagnitude,
            y: direction.y * forceMagnitude
        };
        
        Body.applyForce(this.rk, right, forceVector);
    }
    
    left_force(forceMagnitude) {
        const direction = this.xyangle(this.rk.angle - Math.PI / 2);
        const left = this.left_pos();
        
        const forceVector = {
            x: direction.x * forceMagnitude,
            y: direction.y * forceMagnitude
        };
        
        Body.applyForce(this.rk, left, forceVector);
    }

    setHigh(x){
        this.distanceGround = x;
    }

    getinput(){

        // Extract information from the Matter.js body
        const angle = this.rk.angle;
        const angularVelocity = this.rk.angularVelocity;
        const posX = 0;
        const posY = this.rk.position.y;

        // Calculate derived values
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const distanceFromGround = this.distanceGround - posY; // positive when above ground

        // Create the tensor with the 5 values: [cos(angle), sin(angle), angularVelocity, 0, distanceFromGround]
        const bodyTensor = tf.tensor2d([[
            cosAngle,
            sinAngle,
            angularVelocity,
            posX,
            distanceFromGround
        ]], [1, 5]); // shape: [1, 5] - batch size 1, 5 features
        return bodyTensor;
    }

    initializeBrain(){
        this.brain = new NeuralNetwork();
        this.brain.createModel();
        this.brain.compileModel();
    }

    loadmodel(){
        // to do
    }

    think(){

        const pre = this.brain.predict(this.getinput());

        this.central_force(pre[0]*forceMagnitude);  // Use first output for central force
        this.left_force(pre[1]*forceMagnitude);     // Use second output for left force  
        this.right_force(pre[2]*forceMagnitude);    // Use third output for right force
    }
}

function centerofmass(){

    const b = bottomwidth;
    const a = topwidth;
    const ytrap = (((2*a)+b)/(a+b))*hhigh/3; 
    const masstrap = (a+b)*hhigh/2;

    const ytriang = hhigh + (triangleHeight/3);
    const masstriang = a*triangleHeight/2;

    return ((ytrap*masstrap)+(ytriang*masstriang))/((masstrap + masstriang));
}

// Particle system
export class Particle {
    constructor(x, y, vx, vy, life = 60) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 3 + 2;
        this.color = {
            r: 255,
            g: Math.random() * 255,
            b: 0
        };
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= Math.random() * 1.5; // friction
        this.vy *= 0.98;
        this.vy += 0.1; // gravity
        this.life--;
    }
    
    render(context) {
        const alpha = this.life / this.maxLife;
        const size = this.size * alpha;
        
        context.save();
        context.globalAlpha = alpha;
        context.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        context.beginPath();
        context.arc(this.x, this.y, size, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}