export class Cylinder {
    constructor(
        height,
        radiusTop,
        radiusBottom,
        numSegments,
        color = [1.0, 0.0, 0.0],
        textureMode = false
    ) {
        this.height = height;
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.numSegments = numSegments;
        this.textureMode = textureMode;
        this.color = color;

        this.vertices = [];
        this.indices = [];

        this.generateIndices();
        this.generateVertices();
    }

    generateVertices() {
        const angleIncrement = (2 * Math.PI) / this.numSegments;
        for (let i = 0; i <= this.numSegments; i++) {
            const angle = i * angleIncrement;
            const u = i / this.numSegments;

            const xTop = this.radiusTop * Math.cos(angle);
            const yTop = this.radiusTop * Math.sin(angle);
            if (this.textureMode) {
                this.vertices.push(xTop, yTop, this.height / 2, u, 0.0);
            } else {
                this.vertices.push(xTop, yTop, this.height / 2, ...this.color.slice(0, 3));
            }

            const xBottom = this.radiusBottom * Math.cos(angle);
            const yBottom = this.radiusBottom * Math.sin(angle);
            if (this.textureMode) {
                this.vertices.push(xBottom, yBottom, -this.height / 2, u, 1.0);
            } else {
                this.vertices.push(xBottom, yBottom, -this.height / 2, ...this.color.slice(0, 3));
            }
        }
    }

    generateIndices() {
        for (let i = 0; i < this.numSegments; i++) {
            const current = i * 2;
            const next = (i + 1) % (this.numSegments + 1) * 2;

            this.indices.push(current, next, current + 1);
            this.indices.push(next + 1, current + 1, next);
        }
        const baseCenterIndex = this.vertices.length / 3;
        const topCenterIndex = baseCenterIndex + this.numSegments + 1;

        // Base inferior do cilindro
        for (let i = 0; i < this.numSegments; i++) {
            this.indices.push(i * 2, (i + 1) % this.numSegments * 2, baseCenterIndex);
        }

        // Base superior do cilindro
        for (let i = 0; i < this.numSegments; i++) {
            this.indices.push((i + 1) % this.numSegments * 2 + 1, i * 2 + 1, topCenterIndex);
        }
    }
}
