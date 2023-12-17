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
        this.textureCoord = [];

        this.generateIndices();
        this.generateVertices();
        this.getUnitCircleVertices();
    }

    getUnitCircleVertices() {
        this.sectorStep = (2 * Math.PI) / this.numSegments;
        let sectorAngle;

        const unitCircleVertices = [];
        for (let i = 0; i <= this.numSegments; ++i) {
            sectorAngle = i * this.sectorStep;
            unitCircleVertices.push(
                Math.cos(sectorAngle),
                Math.sin(sectorAngle),
                0
            );
        }
        return unitCircleVertices;
    }

    generateVertices() {
        const angleIncrement = (2 * Math.PI) / this.numSegments;

        this.textureCoord.push(0.5, 0.5);

        for (let j = 0; j < this.numSegments; j++) {
            const angle = j * angleIncrement;
            const xTop = this.radiusTop * Math.cos(angle);
            const yTop = this.radiusTop * Math.sin(angle);

            if (this.textureMode) {
                for (let i = 0; i < 2; i++) {
                    let t = 1.0 - i;
                    this.textureCoord.push(j / this.numSegments, t);
                }
                this.vertices.push(
                    xTop,
                    yTop,
                    this.height / 2,
                    ...this.textureCoord.slice(-2)
                );
            } else {
                this.vertices.push(
                    xTop,
                    yTop,
                    this.height / 2,
                    ...this.color.slice(0, 3)
                );
            }
        }

        for (let j = 0; j < this.numSegments; j++) {
            const angle = j * angleIncrement;
            const xBottom = this.radiusBottom * Math.cos(angle);
            const yBottom = this.radiusBottom * Math.sin(angle);
            if (this.textureMode) {
                for (let i = 0; i < 2; i++) {
                    let t = 1.0 - i;
                    this.textureCoord.push(j / this.numSegments, t);
                }
                this.vertices.push(
                    xBottom,
                    yBottom,
                    -this.height / 2,
                    ...this.textureCoord.slice(-2)
                );
            } else {
                this.vertices.push(
                    xBottom,
                    yBottom,
                    -this.height / 2,
                    ...this.color.slice(0, 3)
                );
            }
        }

        for (let j = 0; j < this.numSegments; j++) {
            const next = (j + 1) % this.numSegments;

            if (this.textureMode) {
                for (let i = 0; i < 2; i++) {
                    let t = 1.0 - i;
                    this.textureCoord.push(j / this.numSegments, t);
                }
                this.vertices.push(
                    this.radiusBottom * Math.cos(next * angleIncrement),
                    this.radiusBottom * Math.sin(next * angleIncrement),
                    -this.height / 2,
                    ...this.textureCoord.slice(-2)
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
