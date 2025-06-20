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
        const x = 400;
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

    xyangle(angle) {
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    central_force(forceMagnitude) {
        const direction = this.xyangle(this.rk.angle - Math.PI / 2);
        const halfHeight = (this.rk.bounds.max.y - this.rk.bounds.min.y) / 2;
        const offsetX = -halfHeight * Math.sin(this.rk.angle);
        const offsetY = halfHeight * Math.cos(this.rk.angle);
        
        const pos_centralF = {
            x: this.rk.position.x + offsetX,
            y: this.rk.position.y + offsetY
        };
        
        const forceVector = {
            x: direction.x * forceMagnitude,
            y: direction.y * forceMagnitude
        };
        
        Body.applyForce(this.rk, pos_centralF, forceVector);
    }
}