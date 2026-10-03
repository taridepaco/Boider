// Obstacles keep their position normalised to the canvas (0..1) so they
// stay in place relative to the canvas when it is resized.
class Obstacle {
    constructor(nx, ny) {
        this.nx = nx;
        this.ny = ny;
        this.x = nx * width;
        this.y = ny * height;
    }

    resize() {
        this.x = this.nx * width;
        this.y = this.ny * height;
    }
}
