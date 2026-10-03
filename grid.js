// Uniform grid for neighbour lookups. With cellSize >= the largest perception
// radius, every neighbour of a point lies in its own cell or one of the 8 around it.
class SpatialGrid {
    constructor() {
        this.cells = [];
        this.cols = 0;
        this.rows = 0;
        this.cellSize = 1;
    }

    resize(w, h, cellSize) {
        const cols = Math.max(1, Math.ceil(w / cellSize));
        const rows = Math.max(1, Math.ceil(h / cellSize));
        if (cols === this.cols && rows === this.rows && cellSize === this.cellSize) return;
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;
        this.cells = Array.from({ length: cols * rows }, () => []);
    }

    clear() {
        for (const cell of this.cells) cell.length = 0;
    }

    cellIndex(x, y) {
        const c = Math.min(this.cols - 1, Math.max(0, Math.floor(x / this.cellSize)));
        const r = Math.min(this.rows - 1, Math.max(0, Math.floor(y / this.cellSize)));
        return r * this.cols + c;
    }

    insert(item) {
        this.cells[this.cellIndex(item.x, item.y)].push(item);
    }

    // Returns the (up to 9) cells around (x, y). The array is reused between
    // calls, so consume it before calling again.
    neighborCells(x, y) {
        const out = this._out || (this._out = []);
        out.length = 0;
        const c = Math.min(this.cols - 1, Math.max(0, Math.floor(x / this.cellSize)));
        const r = Math.min(this.rows - 1, Math.max(0, Math.floor(y / this.cellSize)));
        const c0 = Math.max(0, c - 1), c1 = Math.min(this.cols - 1, c + 1);
        const r0 = Math.max(0, r - 1), r1 = Math.min(this.rows - 1, r + 1);
        for (let rr = r0; rr <= r1; rr++) {
            for (let cc = c0; cc <= c1; cc++) out.push(this.cells[rr * this.cols + cc]);
        }
        return out;
    }
}
