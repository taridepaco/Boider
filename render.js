const flock = [];
const obstaclesNormalized = [[0.25, 0.25],[0.75, 0.25],[0.25, 0.75],[0.75, 0.75]];
const obstacles = [];

function setup() {
    let myCanvas = createCanvas(1200, 800);
    myCanvas.parent('canvasContainer');

    for (let i = 0; i < 100; i++) {
        flock.push(new Boid());
    }
    for (let obstacle of obstaclesNormalized) {
        obstacles.push(new Obstacle(obstacle[0] * width, obstacle[1] * height));
    }
    console.log(obstacles)

}

function draw() {
    background(51);
    for (let obstacle of obstacles) {
        obstacle.show()
    }

    for (let boid of flock) {
        boid.show()
        boid.update(flock, obstacles)
    }
}

