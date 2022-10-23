class Obstacle {
    constructor(x, y) {
        this.position = createVector(x, y)
        this.radiusSeparation = 100
    }

    show() {
        strokeWeight(20);
        stroke('red');
        point(this.position.x, this.position.y);
    }
}