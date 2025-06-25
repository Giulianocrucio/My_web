// Matter.js modules
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;
const Constraint = Matter.Constraint;

let topbottomwidth = 30;
let bottomwidth = 40;
let hhigh = 500;
let triangleHeight = 100;

export class rocketBodies {
    constructor(x, y) {
        const width = bottomwidth;
        const height = hhigh;


        // Create a trapezoid below the rectangle
        const trapezoidTopWidth = topbottomwidth;   
        const trapezoidBottomWidth = bottomwidth;  
        const trapezoidHeight = 170;



        const shapeVertices = [
            { x: -trapezoidTopWidth/2, y: triangleHeight/3 },   // bottom left of triangle
            { x: trapezoidTopWidth/2, y: triangleHeight/3 },    // bottom right of triangle  
            { x: 0, y: -2*triangleHeight/3 },                   // top point of triangle
            // Trapezoid  - bottom
            { x: trapezoidBottomWidth/2, y: height/2 },
            { x: -trapezoidBottomWidth/2, y: height/2}
        ];

        // Create the trapezoid from custom vertices
        this.rk = Bodies.fromVertices(x, y, [shapeVertices], {
            render: { fillStyle: 'red' },
            restitution: 0.4,
            friction: 0.25,
            angularDamping: 0.4
        });

    }


    xyangle(angle) {
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    central_pos(){
        const offsetX = -((hhigh/4)+ triangleHeight/3) * Math.sin(this.rk.angle);
        const offsetY =  ((hhigh/4) + triangleHeight/3) * Math.cos(this.rk.angle);
        
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
        console.log(right)
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