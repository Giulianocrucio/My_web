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
    constructor(x,y) {
        const width = wwidth;
        const height = hhigh;

        this.rk = Bodies.rectangle(x, y, width, height, {
            render: {
                fillStyle: 'red'
            },
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
        const offsetX = -(hhigh/ 2) * Math.sin(this.rk.angle);
        const offsetY =  (hhigh/ 2) * Math.cos(this.rk.angle);
        
        const pos = {
            x: this.rk.position.x + offsetX,
            y: this.rk.position.y + offsetY
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