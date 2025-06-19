const Bodies = Matter.Bodies;


export class rocketBodies {
    constructor() {
        const x = Math.random() * 600 + 100;
        const width = Math.random() * 40 + 30;
        const height = Math.random() * 40 + 30;
        this.box = Bodies.rectangle(x, 50, width, height, {
            render: {
                fillStyle: `hsl(${Math.random() * 360}, 80%, 50%)`
            },
            restitution: Math.random() * 0.8 + 0.2,
            friction: Math.random() * 0.3
        });
    }
}