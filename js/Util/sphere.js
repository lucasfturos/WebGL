export class Sphere {
    constructor(
        radius,
        numSegments,
        color = [1.0, 0.0, 0.0, 1.0],
        textureMode = false
    ) {
        this.radius = radius;
        this.numSegments = numSegments;
        this.color = color;
        this.textureMode = textureMode;

        this.vertices = [];
        this.indices = [];

        this.generateIndices();
        this.generateVertices();
    }

    generateVertices() {
        for (let lat = 0; lat <= this.numSegments; lat++) {
            const theta = (lat * Math.PI) / this.numSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let long = 0; long <= this.numSegments; long++) {
                const phi = (long * 2 * Math.PI) / this.numSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                const u = long / this.numSegments;
                const v = lat / this.numSegments;

                if (this.textureMode) {
                    this.vertices.push(
                        x * this.radius,
                        y * this.radius,
                        z * this.radius,
                        u,
                        v
                    );
                } else {
                    this.vertices.push(
                        x * this.radius,
                        y * this.radius,
                        z * this.radius,
                        ...this.color
                    );
                }
            }
        }
    }

    generateIndices() {
        for (let lat = 0; lat < this.numSegments; lat++) {
            for (let long = 0; long < this.numSegments; long++) {
                const first = lat * (this.numSegments + 1) + long;
                const second = first + this.numSegments + 1;

                this.indices.push(first, second, first + 1);
                this.indices.push(second, second + 1, first + 1);
            }
        }
    }
}