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
        this.uvs = [];

        this.generateVertices();
        this.generateIndices();
    }

    generateVertices() {
        const angleIncrement = (2 * Math.PI) / this.numSegments;

        for (let i = 0; i < this.numSegments; i++) {
            const angle = i * angleIncrement;
            const x = this.radiusTop * Math.cos(angle);
            const y = this.radiusTop * Math.sin(angle);
            if (this.textureMode) {
                this.vertices.push(
                    x,
                    y,
                    this.height / 2,
                    ...this.uvs.slice(-2)
                );
            } else {
                this.vertices.push(
                    x,
                    y,
                    this.height / 2,
                    ...this.color.slice(0, 3)
                );
            }
        }

        for (let i = 0; i < this.numSegments; i++) {
            const angle = i * angleIncrement;
            const x = this.radiusBottom * Math.cos(angle);
            const y = this.radiusBottom * Math.sin(angle);
            if (this.textureMode) {
                this.vertices.push(
                    x,
                    y,
                    -this.height / 2,
                    ...this.uvs.slice(-2)
                );
            } else {
                this.vertices.push(
                    x,
                    y,
                    -this.height / 2,
                    ...this.color.slice(0, 3)
                );
            }
        }

        for (let i = 0; i < this.numSegments; i++) {
            const current = i * 2;
            const next = (i + 1) % this.numSegments;

            if (this.textureMode) {
                this.vertices.push(
                    this.radiusTop * Math.cos(current * angleIncrement),
                    this.radiusTop * Math.sin(current * angleIncrement),
                    this.height / 2,
                    ...this.uvs.slice(-4, -2)
                );
                this.vertices.push(
                    this.radiusBottom * Math.cos(next * angleIncrement),
                    this.radiusBottom * Math.sin(next * angleIncrement),
                    -this.height / 2,
                    ...this.uvs.slice(-2)
                );
            } else {
                this.vertices.push(
                    this.radiusTop * Math.cos(current * angleIncrement),
                    this.radiusTop * Math.sin(current * angleIncrement),
                    this.height / 2,
                    ...this.color.slice(0, 3)
                );
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

        for (let i = 0; i < this.numSegments; i++) {
            this.indices.push(i, (i + 1) % this.numSegments, this.numSegments);
            this.indices.push(
                i + this.numSegments,
                ((i + 1) % this.numSegments) + this.numSegments,
                2 * this.numSegments + 1
            );

            this.indices.push(i, (i + 1) % this.numSegments, this.numSegments);
            this.indices.push(
                i + this.numSegments,
                ((i + 1) % this.numSegments) + this.numSegments,
                2 * this.numSegments + 1
            );
        }
    }
}
