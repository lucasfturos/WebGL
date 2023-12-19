export class Torus {
    constructor(
        innerRadius,
        outerRadius,
        numSegments,
        color = [1.0, 0.0, 0.0, 1.0],
        textureMode = false
    ) {
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.numSegments = numSegments;
        this.textureMode = textureMode;
        this.color = color;

        this.vertices = [];
        this.indices = [];

        this.generateIndices();
        this.generateVertices();
    }

    generateVertices() {
        for (let i = 0; i <= this.numSegments; i++) {
            const u = (i / this.numSegments) * 2 * Math.PI;
            const cosU = Math.cos(u);
            const sinU = Math.sin(u);

            for (let j = 0; j <= this.numSegments; j++) {
                const v = (j / this.numSegments) * 2 * Math.PI;
                const cosV = Math.cos(v);
                const sinV = Math.sin(v);

                const x = (this.outerRadius + this.innerRadius * cosV) * cosU;
                const y = (this.outerRadius + this.innerRadius * cosV) * sinU;
                const z = this.innerRadius * sinV;

                if (this.textureMode) {
                    const uCoord = u / (2 * Math.PI);
                    const vCoord = v / (2 * Math.PI);
                    this.vertices.push(x, y, z, uCoord, vCoord);
                } else {
                    this.vertices.push(x, y, z, ...this.color.slice(0, 4));
                }
            }
        }
    }

    generateIndices() {
        for (let i = 0; i < this.numSegments; i++) {
            for (let j = 0; j < this.numSegments; j++) {
                const p0 = i * (this.numSegments + 1) + j;
                const p1 = p0 + this.numSegments + 1;
                const p2 = p0 + 1;
                const p3 = p1 + 1;

                this.indices.push(p0, p1, p2);
                this.indices.push(p2, p1, p3);
            }
        }
    }
}
