class Boid {
    constructor() {
        const m = Math.min(params.margin, width / 4, height / 4);
        this.x = random(m, width - m);
        this.y = random(m, height - m);
        const angle = random(TWO_PI);
        this.vx = Math.cos(angle) * params.vMax / 2;
        this.vy = Math.sin(angle) * params.vMax / 2;
        this.ax = 0;
        this.ay = 0;
    }

    // Phase 1 of the update: read neighbours, write only this.ax/this.ay.
    computeForces(grid, obstacles) {
        const rC2 = params.radiusCohesion ** 2;
        const rA2 = params.radiusAlignment ** 2;
        const rS2 = params.radiusSeparation ** 2;

        let cohX = 0, cohY = 0, cohN = 0;
        let aliX = 0, aliY = 0, aliN = 0;
        let sepX = 0, sepY = 0, sepN = 0;

        const cells = grid.neighborCells(this.x, this.y);
        for (let c = 0; c < cells.length; c++) {
            const cell = cells[c];
            for (let i = 0; i < cell.length; i++) {
                const other = cell[i];
                if (other === this) continue;
                const dx = this.x - other.x;
                const dy = this.y - other.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < rC2) { cohX += other.x; cohY += other.y; cohN++; }
                if (d2 < rA2) { aliX += other.vx; aliY += other.vy; aliN++; }
                if (d2 < rS2 && d2 > 0) {
                    // closer neighbours push harder: (dx/d) / d
                    sepX += dx / d2; sepY += dy / d2; sepN++;
                }
            }
        }

        this.ax = 0;
        this.ay = 0;
        if (cohN > 0) this.steer(cohX / cohN - this.x, cohY / cohN - this.y, params.cohesionK);
        if (aliN > 0) this.steer(aliX, aliY, params.alignmentK);
        if (sepN > 0) this.steer(sepX, sepY, params.separationK);

        let obsX = 0, obsY = 0, obsN = 0;
        const rO2 = params.obstacleRadius ** 2;
        for (const o of obstacles) {
            const dx = this.x - o.x;
            const dy = this.y - o.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < rO2 && d2 > 0) { obsX += dx / d2; obsY += dy / d2; obsN++; }
        }
        if (obsN > 0) this.steer(obsX, obsY, params.obstacleK);

        this.applyEdges();
    }

    // Reynolds steering: desired velocity along (sx, sy) at full speed,
    // minus current velocity, capped at maxForce, then weighted.
    steer(sx, sy, k) {
        const mag = Math.hypot(sx, sy);
        if (mag === 0) return;
        let fx = sx / mag * params.vMax - this.vx;
        let fy = sy / mag * params.vMax - this.vy;
        const f = Math.hypot(fx, fy);
        if (f > params.maxForce) {
            fx *= params.maxForce / f;
            fy *= params.maxForce / f;
        }
        this.ax += fx * k;
        this.ay += fy * k;
    }

    // Soft walls: push inwards, harder the closer to the edge.
    applyEdges() {
        const m = Math.min(params.margin, width / 4, height / 4);
        const k = params.edgeK;
        if (this.x < m) this.ax += k * (1 - this.x / m);
        if (this.x > width - m) this.ax -= k * (1 - (width - this.x) / m);
        if (this.y < m) this.ay += k * (1 - this.y / m);
        if (this.y > height - m) this.ay -= k * (1 - (height - this.y) / m);
    }

    // Phase 2 of the update: apply forces.
    integrate() {
        this.vx += this.ax;
        this.vy += this.ay;

        const speed = Math.hypot(this.vx, this.vy);
        if (speed > params.vMax) {
            this.vx *= params.vMax / speed;
            this.vy *= params.vMax / speed;
        } else if (speed < params.vMin) {
            if (speed === 0) {
                this.vx = params.vMin;
            } else {
                this.vx *= params.vMin / speed;
                this.vy *= params.vMin / speed;
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        // hard limit as a safety net in case the soft walls are too weak
        if (this.x < 0) { this.x = 0; this.vx = Math.abs(this.vx); }
        if (this.x > width) { this.x = width; this.vx = -Math.abs(this.vx); }
        if (this.y < 0) { this.y = 0; this.vy = Math.abs(this.vy); }
        if (this.y > height) { this.y = height; this.vy = -Math.abs(this.vy); }
    }

    // Adds this boid's triangle to the current beginShape(TRIANGLES) batch.
    addVertices() {
        const speed = Math.hypot(this.vx, this.vy) || 1;
        const hx = this.vx / speed, hy = this.vy / speed;
        vertex(this.x + hx * 8, this.y + hy * 8);
        vertex(this.x - hy * 3, this.y + hx * 3);
        vertex(this.x + hy * 3, this.y - hx * 3);
    }
}
