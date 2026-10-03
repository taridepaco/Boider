const flock = [];
const obstacles = [];
const grid = new SpatialGrid();
const initialObstacles = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];

function canvasSize() {
    const container = document.getElementById('canvasContainer');
    return [container.clientWidth, container.clientHeight];
}

function setup() {
    pixelDensity(1);
    const myCanvas = createCanvas(...canvasSize());
    myCanvas.parent('canvasContainer');

    for (const [nx, ny] of initialObstacles) obstacles.push(new Obstacle(nx, ny));
    setBoidCount(params.boidCount);
}

function windowResized() {
    resizeCanvas(...canvasSize());
    for (const o of obstacles) o.resize();
}

function setBoidCount(n) {
    params.boidCount = n;
    while (flock.length < n) flock.push(new Boid());
    flock.length = n;
}

function draw() {
    // 1. rebuild neighbour grid
    const cellSize = Math.max(params.radiusCohesion, params.radiusAlignment, params.radiusSeparation);
    grid.resize(width, height, cellSize);
    grid.clear();
    for (const boid of flock) grid.insert(boid);

    // 2. compute every force from the same snapshot, 3. then move
    for (const boid of flock) boid.computeForces(grid, obstacles);
    for (const boid of flock) boid.integrate();

    // 4. draw in batches
    background(51);

    stroke(200, 40, 40);
    strokeWeight(20);
    for (const o of obstacles) point(o.x, o.y);

    noStroke();
    fill(255);
    beginShape(TRIANGLES);
    for (const boid of flock) boid.addVertices();
    endShape();
}
