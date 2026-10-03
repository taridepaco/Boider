const flock = [];
const obstacles = [];
const grid = new SpatialGrid();
const initialObstacles = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];

// Mouse/touch over the canvas. A mouse acts while hovering, a finger while touching.
const pointer = { active: false, x: 0, y: 0 };

function canvasSize() {
    const container = document.getElementById('canvasContainer');
    return [Math.max(1, container.clientWidth), Math.max(1, container.clientHeight)];
}

function setup() {
    pixelDensity(1);
    const myCanvas = createCanvas(...canvasSize());
    myCanvas.parent('canvasContainer');
    setupPointer(myCanvas.elt);

    // the container also changes size when the panel is folded, not only on window resize
    new ResizeObserver(fitCanvas).observe(document.getElementById('canvasContainer'));

    resetObstacles();
    setBoidCount(params.boidCount);
}

function fitCanvas() {
    const [w, h] = canvasSize();
    if (w === width && h === height) return;
    resizeCanvas(w, h);
    for (const o of obstacles) o.resize();
}

function windowResized() {
    fitCanvas();
}

function setBoidCount(n) {
    params.boidCount = n;
    while (flock.length < n) flock.push(new Boid());
    flock.length = n;
}

function resetBoids() {
    flock.length = 0;
    setBoidCount(params.boidCount);
}

function resetObstacles() {
    obstacles.length = 0;
    for (const [nx, ny] of initialObstacles) obstacles.push(new Obstacle(nx, ny));
}

function clearObstacles() {
    obstacles.length = 0;
}

function setupPointer(canvas) {
    const move = (e) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
    };
    canvas.addEventListener('pointerenter', (e) => { move(e); if (e.pointerType === 'mouse') pointer.active = true; });
    canvas.addEventListener('pointerleave', () => { pointer.active = false; });
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') pointer.active = false; });
    canvas.addEventListener('pointercancel', () => { pointer.active = false; });
    canvas.addEventListener('pointerdown', (e) => {
        move(e);
        pointer.active = true;
        if (params.mouseMode === 'obstacle') toggleObstacleAt(pointer.x, pointer.y);
    });
}

// Removes the obstacle under (x, y) or, if there is none, adds one there.
function toggleObstacleAt(x, y) {
    const hit = obstacles.findIndex((o) => (o.x - x) ** 2 + (o.y - y) ** 2 < 20 ** 2);
    if (hit >= 0) obstacles.splice(hit, 1);
    else obstacles.push(new Obstacle(x / width, y / height));
}

function draw() {
    // 1. rebuild neighbour grid
    const cellSize = Math.max(params.radiusCohesion, params.radiusAlignment, params.radiusSeparation);
    grid.resize(width, height, cellSize);
    grid.clear();
    for (const boid of flock) grid.insert(boid);

    // 2. compute every force from the same snapshot, 3. then move
    for (const boid of flock) boid.computeForces(grid, obstacles, pointer);
    for (const boid of flock) boid.integrate();

    // 4. draw in batches
    background(34, 38, 46);

    noFill();
    strokeWeight(1);
    stroke(200, 60, 60, 60);
    for (const o of obstacles) circle(o.x, o.y, params.obstacleRadius * 2);
    stroke(200, 40, 40);
    strokeWeight(20);
    for (const o of obstacles) point(o.x, o.y);

    if (pointer.active && params.mouseMode !== 'obstacle') {
        strokeWeight(1.5);
        if (params.mouseMode === 'predator') stroke(240, 90, 90, 160);
        else stroke(90, 210, 140, 160);
        circle(pointer.x, pointer.y, params.mouseRadius * 2);
    }

    noStroke();
    fill(240);
    beginShape(TRIANGLES);
    for (const boid of flock) boid.addVertices();
    endShape();
}
