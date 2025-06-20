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
            friction: 0.15,
            angularDamping: 0.2
        });
    }

    // Method to apply force to the body
    central_force(forceVector) {
        Body.applyForce(this.rk, this.getBottomPosition(), forceVector);
    }

    Body_direction(){
        const x = Math.cos(this.rk.angle);
        const y = Math.sin(this.rk.angle);
        return { x, y };
    }

    getBottomPosition() {
        // Get the angle of the body
        const angle = this.rk.angle;
        // Get half height
        const halfHeight = (this.rk.bounds.max.y - this.rk.bounds.min.y) / 2;
        // Calculate the offset from the center to the bottom center
        // Only vertical offset (downwards in local coordinates)
        const offsetX = -halfHeight * Math.sin(angle);
        const offsetY = halfHeight * Math.cos(angle);
        // Return the absolute position of the bottom center
        return {
            x: this.rk.position.x + offsetX,
            y: this.rk.position.y + offsetY
        };
    }
        
}