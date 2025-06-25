// rocket.js - Fixed version
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
let trapezBottomWidth = wwidth * 1.5;
let trapezHeight = 20;

export class rocketBodies {
    constructor(x, y) {
        const width = wwidth;
        const height = hhigh;

        // Create the main rectangle body
        this.rect = Bodies.rectangle(x, y, width, height, {
            render: {
                fillStyle: 'red'
            },
            restitution: 0.2, // Reduced from 0.4
            friction: 0.8,    // Increased from 0.25
            frictionStatic: 0.9, // Added static friction
            angularDamping: 0.8  // Increased from 0.4
        });

        // Calculate the top position of the rectangle
        const topPos = this.top_pos();
        
        // Create triangle vertices for the nose cone
        const triangleVertices = [
            { x: -width/2, y: triangleHeight/3 },
            { x: width/2, y: triangleHeight/3 },
            { x: 0, y: -2*triangleHeight/3 }
        ];

        this.triangle = Bodies.fromVertices(topPos.x, topPos.y - triangleHeight/3, [triangleVertices], {
            render: {
                fillStyle: 'red'
            },
            restitution: 0.2,
            friction: 0.8,
            frictionStatic: 0.9,
            angularDamping: 0.8
        });

        // Create trapezoid with better positioning to avoid overlap
        const trapezoidTopWidth = width;
        const trapezoidBottomWidth = trapezBottomWidth;
        const trapezoidHeight = trapezHeight;

        const halfTop = trapezoidTopWidth / 2;
        const halfBottom = trapezoidBottomWidth / 2;

        // Position with small gap to avoid overlap
        const trapezoidCenterY = y + height / 2 + trapezoidHeight / 2 + 2; // Added 2px gap

        const trapezoidVertices = [
            { x: -halfTop, y: -trapezoidHeight / 2 },
            { x: halfTop, y: -trapezoidHeight / 2 },
            { x: halfBottom, y: trapezoidHeight / 2 },
            { x: -halfBottom, y: trapezoidHeight / 2 }
        ];

        this.trapezoid = Bodies.fromVertices(x, trapezoidCenterY, [trapezoidVertices], {
            render: { fillStyle: 'red' },
            restitution: 0.2,
            friction: 0.8,
            frictionStatic: 0.9,
            angularDamping: 0.8
        });

        // Create compound body with better stability settings
        this.compound = Body.create({
            parts: [this.rect, this.triangle, this.trapezoid],
            render: {
                fillStyle: 'red'
            },
            restitution: 0.2,
            friction: 0.8,
            frictionStatic: 0.9,
            angularDamping: 0.8
        });

        // Set proper slop values for all parts
        this.compound.parts.forEach(part => {
            part.slop = 0.05; // Reduced slop
            part.sleepThreshold = 60; // Allow sleeping
        });

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
        const offsetX = -(trapezHeight + hhigh/ 2 + 2) * Math.sin(this.rk.angle); // Added gap
        const offsetY =  (trapezHeight + hhigh/ 2 + 2) * Math.cos(this.rk.angle);
        
        const pos = {
            x: this.rect.position.x + offsetX,
            y: this.rect.position.y + offsetY
        };
        return pos;
    }

    right_pos(){
        const central = this.central_pos();
        const offsetXr = (trapezBottomWidth / 2) * Math.sin(Math.PI / 2 - this.rk.angle);
        const offsetYr = (trapezBottomWidth/ 2) * Math.sin(this.rk.angle);
        const right = {
            x: central.x + offsetXr,
            y: central.y + offsetYr
        };
        return right;
    }

    left_pos(){
        const central = this.central_pos();
        const offsetXr = -(trapezBottomWidth / 2) * Math.sin(Math.PI / 2 - this.rk.angle);
        const offsetYr = -(trapezBottomWidth / 2) * Math.sin(this.rk.angle);
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

// Particle system remains the same
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
        this.vx *= Math.random() * 1.5;
        this.vy *= 0.98;
        this.vy += 0.1;
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