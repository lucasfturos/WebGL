import { WebGL } from "../app.js";
import {
    vertexShaderSrc,
    fragmentShaderSrc,
} from "../Shader/triangleRotate.js";
import {
    glMatrix,
    mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm";

class TriangleRotate extends WebGL {
    constructor(canvasID) {
        super(canvasID);

        this.setupShaders();
        this.setupBuffers();
        this.handleResize();
        window.addEventListener("resize", () => this.handleResize());
        this.setupMatrices();
        this.render();
    }

    setupShaders() {
        this.program = this.gl.createProgram();
        const vertexShader = this.createShader(
            this.gl.VERTEX_SHADER,
            vertexShaderSrc
        );
        const fragmentShader = this.createShader(
            this.gl.FRAGMENT_SHADER,
            fragmentShaderSrc
        );
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error(
                "ERROR linking program!",
                this.gl.getProgramInfoLog(this.program)
            );
            return;
        }

        this.gl.useProgram(this.program);
    }

    setupBuffers() {
        this.triangleVertices = [
            // x, y  | R, G, B
            0.0, 0.5, 1.0, 0.0, 0.0, -0.5, -0.5, 0.0, 1.0, 0.0, 0.5, -0.5, 0.0,
            0.0, 1.0,
        ];
        const triangleVertex = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, triangleVertex);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(this.triangleVertices),
            this.gl.STATIC_DRAW
        );

        const positionAttr = this.gl.getAttribLocation(
            this.program,
            "vertPosition"
        );
        const colorAttr = this.gl.getAttribLocation(this.program, "vertColor");

        this.gl.vertexAttribPointer(
            positionAttr,
            2,
            this.gl.FLOAT,
            this.gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.gl.vertexAttribPointer(
            colorAttr,
            3,
            this.gl.FLOAT,
            this.gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT,
            2 * Float32Array.BYTES_PER_ELEMENT
        );
        this.gl.enableVertexAttribArray(positionAttr);
        this.gl.enableVertexAttribArray(colorAttr);
    }

    setupMatrices() {
        this.matWorldUniform = this.gl.getUniformLocation(
            this.program,
            "mWorld"
        );
        this.matViewUniform = this.gl.getUniformLocation(this.program, "mView");
        this.matProjUniform = this.gl.getUniformLocation(this.program, "mProj");

        this.worldMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();

        mat4.lookAt(
            this.viewMatrix,
            [0.0, 0.0, -1.6],
            [0.0, -0.1, 0.0],
            [0.0, 1.0, 0.0]
        );
        mat4.perspective(
            this.projMatrix,
            glMatrix.toRadian(45),
            this.canvas.width / this.canvas.height,
            0.1,
            100.0
        );

        this.gl.uniformMatrix4fv(
            this.matViewUniform,
            this.gl.FALSE,
            this.viewMatrix
        );
        this.gl.uniformMatrix4fv(
            this.matProjUniform,
            this.gl.FALSE,
            this.projMatrix
        );
    }

    render() {
        let angle = 0.0;
        const identityMatrix = mat4.create();
        const yRotationMatrix = mat4.create();

        const loop = () => {
            angle = (performance.now() / 1000) * Math.PI;
            mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
            mat4.mul(this.worldMatrix, yRotationMatrix, identityMatrix);

            this.gl.uniformMatrix4fv(
                this.matWorldUniform,
                this.gl.FALSE,
                this.worldMatrix
            );

            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

new TriangleRotate("triangle-rotate");
