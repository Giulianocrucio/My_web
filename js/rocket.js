// Matter.js modules
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;


let wwidth = 40;
let hhigh = 140;

export class rocketBodies {
    constructor() {
        const x = 400; // generation point
        const y = 50;
        const width = wwidth;
        const height = hhigh;

        this.rk = Bodies.rectangle(x, y, width, height, {
            render: {
            fillStyle: 'red'
            },
            restitution: 0.6,
            friction: 0.15
        });
    }

    // Method to apply force to the body
    central_force(forceVector) {
        Body.applyForce(this.rk, this.getBottomRightPosition(), forceVector);
    }

    Body_direction(){
        const x = Math.cos(this.rk.angle);
        const y = Math.sin(this.rk.angle);
        return { x, y };
    }

    getBottomRightPosition() {
        // Get the angle of the body
        const angle = this.rk.angle;
        // Get half width and half height
        const halfWidth = (this.rk.bounds.max.x - this.rk.bounds.min.x) / 2;
        const halfHeight = (this.rk.bounds.max.y - this.rk.bounds.min.y) / 2;
        // Calculate the offset from the center to the bottom right corner
        const offsetX = halfWidth * Math.cos(angle) - halfHeight * Math.sin(angle);
        const offsetY = halfWidth * Math.sin(angle) + halfHeight * Math.cos(angle);
        // Return the absolute position of the bottom right corner
        return {
            x: this.rk.position.x + offsetX,
            y: this.rk.position.y + offsetY
        };
    }
        
}