const flock = [];
const obstacles = [];
const grid = new SpatialGrid();
const initialObstacles = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];

// Mouse/touch over the canvas. A mouse acts while hovering, a finger while touching.
const pointer = { active: false, x: 0, y: 0 };

// The world is the canvas in CSS px. It is made (flock and obstacles) once the canvas has its
// final size, see setup().
let worldReady = false;

// frames per second for the status line (ui.js)
let fps = 0, statT = 0, statFrames = 0;

// Canvas colours. The canvas does not inherit the CSS tokens, so they are read
// from the page and refreshed when the theme changes (ui.js calls readPalette).
// The sky is the one from the taridepaco island, with a day and a night version.
const SKY = { day: ['#62bcd6', '#d9f2de'], night: ['#0a1424', '#274657'] };
const BAIT = { day: '#4f8f47', night: '#74b34e' }; // "bosque" and "prado" of the shared palette
let palette = null;

function readPalette() {
    if (typeof color !== 'function') return; // p5 not ready yet; setup() calls again
    const css = getComputedStyle(document.documentElement);
    const token = (name, alpha) => {
        const c = color(css.getPropertyValue(name).trim());
        if (alpha !== undefined) c.setAlpha(alpha);
        return c;
    };
    const dark = window.Theme
        ? Theme.isDark()
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const bait = color(dark ? BAIT.night : BAIT.day);
    bait.setAlpha(70);
    palette = {
        sky: dark ? SKY.night : SKY.day,
        ink: token('--ink'),
        obstacle: token('--accent'),
        obstacleReach: token('--accent', 150),
        obstacleArea: token('--accent', 28),
        predator: token('--accent', 70),
        bait,
    };
}

function canvasSize() {
    const container = document.getElementById('canvasContainer');
    return [Math.max(1, container.clientWidth), Math.max(1, container.clientHeight)];
}

// The canvas is drawn at the real pixels of the screen (CSS size × devicePixelRatio), so the
// boids are sharp on phones. The simulation still works in CSS px.
function screenDensity() {
    return window.devicePixelRatio || 1;
}

function setup() {
    pixelDensity(screenDensity());
    const myCanvas = createCanvas(...canvasSize());
    myCanvas.parent('canvasContainer');
    setupPointer(myCanvas.elt);

    // the container also changes size when the panel is folded, not only on window resize
    new ResizeObserver(fitCanvas).observe(document.getElementById('canvasContainer'));

    readPalette();

    // The world takes the size of the canvas, and the canvas only has its final size once the web
    // fonts are in: they change the width of the folded panel and the height of the top bar.
    // Waits for them, 1.5 s at most; until then the canvas shows only the sky.
    const fontsReady = document.fonts && document.fonts.ready
        ? Promise.race([document.fonts.ready, new Promise((done) => setTimeout(done, 1500))])
        : Promise.resolve();
    fontsReady.then(() => {
        fitCanvas();
        worldReady = true;
        resetObstacles();
        setBoidCount(params.boidCount);
        fps = 0; // the status line shows up with the first measure, half a second later
        statFrames = 0;
        statT = performance.now();
    });
}

function fitCanvas() {
    const [w, h] = canvasSize();
    const density = screenDensity();
    if (w === width && h === height && density === pixelDensity()) return;
    if (density !== pixelDensity()) pixelDensity(density); // browser zoom, or another screen
    resizeCanvas(w, h);
    for (const o of obstacles) o.resize();
}

function windowResized() {
    fitCanvas();
}

function setBoidCount(n) {
    params.boidCount = n;
    if (!worldReady) return; // the flock is made once the canvas has its final size
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
        if (!worldReady) return;
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
    // a change of devicePixelRatio alone (the window moved to another screen) does not resize
    // the container, so the ResizeObserver does not see it
    if (pixelDensity() !== screenDensity()) fitCanvas();

    // 1. rebuild neighbour grid
    const cellSize = Math.max(params.radiusCohesion, params.radiusAlignment, params.radiusSeparation);
    grid.resize(width, height, cellSize);
    grid.clear();
    for (const boid of flock) grid.insert(boid);

    // 2. compute every force from the same snapshot, 3. then move
    for (const boid of flock) boid.computeForces(grid, obstacles, pointer);
    for (const boid of flock) boid.integrate();

    // 4. draw in batches
    const sky = drawingContext.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, palette.sky[0]);
    sky.addColorStop(1, palette.sky[1]);
    drawingContext.fillStyle = sky;
    drawingContext.fillRect(0, 0, width, height);

    // obstacles: reach as a faint disc, the obstacle itself as a square block
    strokeWeight(1.5);
    stroke(palette.obstacleReach);
    fill(palette.obstacleArea);
    for (const o of obstacles) circle(o.x, o.y, params.obstacleRadius * 2);
    rectMode(CENTER);
    strokeWeight(3);
    stroke(palette.ink);
    fill(palette.obstacle);
    for (const o of obstacles) square(o.x, o.y, 20);

    if (pointer.active && params.mouseMode !== 'obstacle') {
        strokeWeight(2);
        stroke(palette.ink);
        fill(params.mouseMode === 'predator' ? palette.predator : palette.bait);
        circle(pointer.x, pointer.y, params.mouseRadius * 2);
    }

    noStroke();
    fill(palette.ink);
    beginShape(TRIANGLES);
    for (const boid of flock) boid.addVertices();
    endShape();

    statFrames++;
    const now = performance.now();
    if (now - statT > 500) {
        fps = statFrames * 1000 / (now - statT);
        statFrames = 0;
        statT = now;
        paintStats();
    }
}
