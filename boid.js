class Boid {
    constructor() {
        this.radiusCohesion = 70
        this.radiusSeparation = 40
        this.radiusSeparationObs = 80
        this.radiusAlignment = 100

        this.cohesionK = 0.001
        this.separationK = 0.03
        this.alignmentK = 0.1

        this.vMax = 8
        this.margin = 150
        this.increment = 1

        this.position = createVector(random(this.margin-10, width - this.margin-10), random(this.margin-10, height - this.margin-10));
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
    }

    update(flock, obstacles) {
        // update position
        this.position.add(this.velocity);
        this.fixPosition()

        // update velocity
        this.velocity.add(this.acceleration);
        this.fixVelocity()

        // update acceleration
        const cohesion = p5.Vector.mult(this.getCohesion(flock), this.cohesionK);
        const alignment = p5.Vector.mult(this.getAlignment(flock), this.alignmentK);
        const separation = p5.Vector.mult(this.getSeparation(flock, obstacles), this.separationK);
        this.acceleration = p5.Vector.add(alignment, p5.Vector.add(separation, cohesion))
    }

    show() {
        strokeWeight(2);
        stroke(255);
        this.getShape()
        // point(this.position.x, this.position.y);
        
    }

    getShape() {
        if (this.velocity.mag() < 0.001) {
            strokeWeight(12)
            point(this.position.x, this.position.y);
        } else  {
            const p1 = p5.Vector.add(createVector(this.velocity.x, this.velocity.y).normalize().mult(8), this.position)
            const p2 = p5.Vector.add(createVector(-this.velocity.y, this.velocity.x).normalize().mult(3), this.position)
            const p3 = p5.Vector.add(createVector(this.velocity.y, -this.velocity.x).normalize().mult(3), this.position)
        triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)}
    }

    getCohesion(flock) {
        const rest = flock.filter((boid) => boid !== this)
        let number = 0
        const avgPosition = createVector(0, 0)
        for (let other of rest) {
            const dist = p5.Vector.sub(this.position, other.position).mag()
            if (dist < this.radiusCohesion) {
                avgPosition.add(other.position)
                number ++
            } 
        }
        if (number === 0) return createVector(0, 0)
        avgPosition.div(number)
        // point(avgPosition.x, avgPosition.y)
        return p5.Vector.sub(avgPosition, this.position )
    }

    getAlignment(flock) {
        const rest = flock.filter((boid) => boid !== this)
        let number = 0
        const avgVelocity = createVector(0, 0)
        for (let other of rest) {
            const dist = p5.Vector.sub(this.position, other.position).mag()
            if (dist < this.radiusAlignment) {
                avgVelocity.add(other.velocity)
                number ++
            }  
        }
        if (number === 0) return createVector(0, 0)
        avgVelocity.div(number).normalize().mult(this.vMax)
        return p5.Vector.sub(avgVelocity, this.velocity)
        
    }

    getSeparation(flock, obstacles) {
        const rest = flock.filter((boid) => boid !== this)
        const allAvoids = rest.concat(obstacles)
        let number = 0
        const avgDistance = createVector(0, 0)

        for (let obstacle of allAvoids) {
            const dist = p5.Vector.sub(this.position, obstacle.position).mag()
            if (dist < obstacle.radiusSeparation) {
                avgDistance.add(p5.Vector.sub(this.position, obstacle.position))
                number ++
            }
        }

        if (number === 0) return createVector(0, 0)
        avgDistance.div(number)
        return p5.Vector.sub(avgDistance, this.velocity)
    }

    fixPosition() {
        if (this.position.x > width) this.position.x -= width;
        if (this.position.x < 0) this.position.x += width;
        if (this.position.y > height) this.position.y -= height;
        if (this.position.y < 0) this.position.y += height;

        if (this.position.x < this.margin) this.acceleration.x += (this.increment * (1 - this.position.x / this.margin));
        if (this.position.x > width - this.margin) this.acceleration.x -= (this.increment * (1 - (width - this.position.x) / this.margin));
        if (this.position.y < this.margin) this.acceleration.y += (this.increment * (1 - this.position.y / this.margin))
        if (this.position.y > height - this.margin) this.acceleration.y -= (this.increment * (1 - (height - this.position.y) / this.margin));
    }

    fixVelocity() {
        const magVel = this.velocity.mag()
        if (magVel > this.vMax) {
            this.velocity.normalize().mult(this.vMax)
        } else {
            this.velocity.mult(1.01)
        }
    }

}
