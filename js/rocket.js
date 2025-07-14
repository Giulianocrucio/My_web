import { NNs } from './BrainRocket.js';
import { mixBrains } from './BrainRocket.js';
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
        const angularVelocity = this.rk.angularVelocity * 100 ;
        const posX = 0;

        // Calculate derived values
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const distanceFromGround = (this.distanceGround - this.central_pos().y) / 300; 

        // Create the tensor with the 5 values: [cos(angle), sin(angle), angularVelocity, 0, distanceFromGround]
        const bodyTensor = [
            cosAngle,
            sinAngle,
            angularVelocity,
            posX,
            distanceFromGround
        ]; 
        return bodyTensor;
    }

    initializeBrain(){
        this.brain = new NNs();
    }

    loadmodel(){
        // to do
    }

    think(){

        const pre = this.brain.forward(this.getinput());

        this.central_force(pre[0]*forceMagnitude);  // Use first output for central force
        this.left_force(pre[1]*forceMagnitude);     // Use second output for left force  
        this.right_force(pre[2]*forceMagnitude);    // Use third output for right force
    }

    // score

    getScore(velocityBeforeImpact = -1){
        let score = 0;

        // if impact with the ground
        if(velocityBeforeImpact != -1){
            score = 2;
        }

        // distance from the ground
        let scale = 1;

        // positive basis of the rocket when above ground
        const distanceFromGround = this.distanceGround - this.central_pos().y; 
        score += Math.exp(-Math.abs(distanceFromGround)) * scale;

        // check angular velocity
        scale = 1;
        const angleV = this.rk.angularVelocity;
        score += Math.exp(-Math.abs(angleV)) ;

        // check orientation
        scale = 1;
        const angle = this.rk.angle;
        const normalizedAngle = (angle % (2 * Math.PI));
        score += Math.exp(-Math.abs(normalizedAngle))*scale;

        // check velocity
        scale = 1;
        if(velocityBeforeImpact != -1){
            score += Math.exp(-velocityBeforeImpact) * scale;
        }
        else{
            score += Math.exp(-Body.getSpeed(this.rk)) * scale;
        }

        return score;

    }

    async loadModel(loadPath) {
        this.brain.loadWeights(loadPath);
    }

}
export async function  UpdateBrains(rockets, scores, n_toSave, n_gen){

        const IndicesSorted = sortIndeces(scores);
        let parents_brains = [];
        n_toSave = Math.min(n_toSave,rockets.length);

        for(let i = 0; i < n_toSave; i++){
            parents_brains.push(rockets[IndicesSorted[i]].brain);
        }

        // console.log(parents_brains[0].printNetworkInfo());

        const child_brains = mixBrains(parents_brains, n_toSave, 0.1);
        
        return child_brains;

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

export function sortIndeces(input_vec) {
    // Create a copy of input_vec with value-index pairs
    let toSort = input_vec.map((value, index) => [value, index]);
    toSort.sort(function(left, right) {
        return left[0] > right[0] ? -1 : 1;
    });
    let indeces = [];
    for (var j = 0; j < toSort.length; j++) {
        indeces.push(toSort[j][1]);
    }
    return indeces;
}