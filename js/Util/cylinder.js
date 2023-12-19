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
        for (let i = 0; i < this.numSegments; i++) {
            const angle = i * angleIncrement;
            const xTop = this.radiusTop * Math.cos(angle);
            const yTop = this.radiusTop * Math.sin(angle);
            const u = i / this.numSegments;
            const v = 0.0;

            if (this.textureMode) {
                this.vertices.push(xTop, yTop, this.height / 2, u, v);
                if (i === this.numSegments) {
                    this.vertices.push(
                        this.radiusTop * Math.cos(0),
                        this.radiusTop * Math.sin(0),
                        this.height / 2,
                        1.0, 0.0
                    );
                }

            } else {
                this.vertices.push(
                    xTop,
                    yTop,
                    this.height / 2,
                    ...this.color.slice(0, 3)
                );
            }
        }

        for (let i = 0; i < this.numSegments; i++) {
            const angle = i * angleIncrement;
            const xBottom = this.radiusBottom * Math.cos(angle);
            const yBottom = this.radiusBottom * Math.sin(angle);
            const u = i / this.numSegments;
            const v = 1.0;

            if (this.textureMode) {
                this.vertices.push(xBottom, yBottom, -this.height / 2, u, v);
            } else {
                this.vertices.push(
                    xBottom,
                    yBottom,
                    -this.height / 2,
                    ...this.color.slice(0, 3)
                );
            }
        }

        for (let i = 0; i < this.numSegments; i++) {
            const next = (i + 1) % this.numSegments;

            if (this.textureMode) {
                this.vertices.push(
                    this.radiusBottom * Math.cos(next * angleIncrement),
                    this.radiusBottom * Math.sin(next * angleIncrement),
                    -this.height / 2,
                    0.0,
                    0.0
                );
            } else {
                this.vertices.push(
                    this.radiusBottom * Math.cos(next * angleIncrement),
                    this.radiusBottom * Math.sin(next * angleIncrement),
                    -this.height / 2,
                    ...this.color.slice(0, 3)
                );
            }
        }
    }

    generateIndices() {
        for (let i = 0; i < this.numSegments; i++) {
            const current = i;
            const next = (i + 1) % this.numSegments;

            this.indices.push(current, next, current + this.numSegments);
            this.indices.push(
                next + this.numSegments,
                current + this.numSegments,
                next
            );
            this.indices.push(current, next, current + this.numSegments);
        }

        const baseCenterIndex = this.vertices.length / 3;
        const topCenterIndex = baseCenterIndex + this.numSegments + 1;
        for (let i = 0; i < this.numSegments; i++) {
            this.indices.push(i, (i + 1) % this.numSegments, baseCenterIndex);
        }

        for (let i = 0; i < this.numSegments; i++) {
            this.indices.push(
                topCenterIndex + i,
                topCenterIndex + ((i + 1) % this.numSegments),
                topCenterIndex
            );
        }
    }
}
