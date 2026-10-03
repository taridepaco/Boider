// Global simulation parameters. Everything reads from here every frame,
// so changing a value takes effect immediately.
const DEFAULT_PARAMS = {
    boidCount: 200,

    // perception radii (px)
    radiusCohesion: 70,
    radiusAlignment: 100,
    radiusSeparation: 30,

    // rule weights
    cohesionK: 1.0,
    alignmentK: 1.0,
    separationK: 1.5,
    obstacleK: 3.0,

    vMax: 4,
    vMin: 1.5,
    maxForce: 0.1,

    // soft walls
    margin: 100,
    edgeK: 0.3,

    obstacleRadius: 80,

    // field of view in degrees: neighbours behind the boid are ignored
    fov: 270,

    // mouse: 'obstacle' (click to add/remove), 'predator' (flee), 'bait' (attract)
    mouseMode: 'obstacle',
    mouseRadius: 150,
    mouseK: 2.0,
};

const params = { ...DEFAULT_PARAMS };
