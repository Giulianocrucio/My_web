// Matter.js modules
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;
const Constraint = Matter.Constraint;

let wwidth = 20;
let hhigh = 140;
let triangleHeight = 140;

export class rocketBodies {
    constructor(x, y) {
        const width = wwidth;
        const height = hhigh;

        // Create the main rectangle body
        this.rect = Bodies.rectangle(x, y, width, height, {
            render: {
                fillStyle: 'red'
            },
            restitution: 0.4,
            friction: 0.25,
            angularDamping: 0.4
        });

        // Calculate the top position of the rectangle
        const topPos = this.top_pos();
        
        // Create triangle vertices for the nose cone
        // Triangle base sits at the top of the rectangle, pointing upward
        const triangleVertices = [
            { x: -width/2, y: triangleHeight/3 }, // bottom left of triangle
            { x: width/2, y: triangleHeight/3 },  // bottom right of triangle  
            { x: 0, y: -2*triangleHeight/3 } // top point of triangle
        ];

        // Create the triangle body at the top position, moved by triangleHeight/3
        this.triangle = Bodies.fromVertices(topPos.x, topPos.y - triangleHeight/3, [triangleVertices], {
            render: {
                fillStyle: 'red'
            },
            restitution: 0.4,
            friction: 0.25,
            angularDamping: 0.4
        });
        // Create a trapezoid below the rectangle
        const trapezoidTopWidth = width;           // top = same as rectangle
        const trapezoidBottomWidth = width * 1.5;  // wider bottom
        const trapezoidHeight = 20;

        const halfTop = trapezoidTopWidth / 2;
        const halfBottom = trapezoidBottomWidth / 2;

        // Position just below the rectangle
        const trapezoidCenterY = y + height / 2 + trapezoidHeight / 2;

        // Define custom vertices for the trapezoid
        const trapezoidVertices = [
            { x: -halfTop, y: -trapezoidHeight / 2 },   // top left (touches rectangle)
            { x: halfTop, y: -trapezoidHeight / 2 },    // top right (touches rectangle)
            { x: halfBottom, y: trapezoidHeight / 2 },  // bottom right (wider)
            { x: -halfBottom, y: trapezoidHeight / 2 }  // bottom left (wider)
        ];

        // Create the trapezoid from custom vertices
        this.trapezoid = Bodies.fromVertices(x, trapezoidCenterY, [trapezoidVertices], {
            render: { fillStyle: 'red' },
            restitution: 0.4,
            friction: 0.25,
            angularDamping: 0.4
        });

        // Create a compound body by combining rectangle and triangle
        this.compound = Body.create({
            parts: [this.rect, this.triangle, this.trapezoid],
            render: {
                fillStyle: 'red'
            },
            restitution: 0.4,
            friction: 0.25,
            angularDamping: 0.4
        });

        // Update reference to use the compound body
        this.rk = this.compound;
    }

    top_pos(){
        const offsetX = (hhigh/ 2) * Math.sin(this.rect.angle);
        const offsetY = -(hhigh/ 2) * Math.cos(this.rect.angle);
        
        const pos = {
            x: this.rect.position.x + offsetX,
            y: this.rect.position.y + offsetY
        };
        return pos;
    }

    xyangle(angle) {
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    central_pos(){
        const offsetX = -(hhigh/ 2) * Math.sin(this.rk.angle);
        const offsetY =  (hhigh/ 2) * Math.cos(this.rk.angle);
        
        const pos = {
            x: this.rect.position.x + offsetX,
            y: this.rect.position.y + offsetY
        };
        return pos;
    }

    right_pos(){
        const central = this.central_pos();
        const offsetXr = (wwidth / 2) * Math.sin(Math.PI / 2 - this.rk.angle);
        const offsetYr = (wwidth/ 2) * Math.sin(this.rk.angle);
        const right = {
            x: central.x + offsetXr,
            y: central.y + offsetYr
        };
        console.log(right)
        return right;
    }

    left_pos(){
        const central = this.central_pos();
        const offsetXr = -(wwidth / 2) * Math.sin(Math.PI / 2 - this.rk.angle);
        const offsetYr = -(wwidth/ 2) * Math.sin(this.rk.angle);
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