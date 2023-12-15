import { WebGL } from "../app.js";
import { boxIndices, boxVerticesRGB } from "../Util/box.js";
import {
    glMatrix,
    mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm";
import { vertexShaderSrc, fragmentShaderSrc } from "../Shader/cubo3D.js";

class Cubo3D extends WebGL {
    constructor(canvasID) {
        super(canvasID);

        this.setupShaders();
        this.setupBuffers();
        this.setupMatrices();
        this.render();
    }

    setupShaders() {
        const vertexShader = this.createShader(
            this.gl.VERTEX_SHADER,
            vertexShaderSrc
        );
        const fragmentShader = this.createShader(
            this.gl.FRAGMENT_SHADER,
            fragmentShaderSrc
        );

        this.program = this.gl.createProgram();
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
        const boxVertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boxVertexBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(boxVerticesRGB),
            this.gl.STATIC_DRAW
        );

        const boxIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, boxIndexBuffer);
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(boxIndices),
            this.gl.STATIC_DRAW
        );

        const posAttr = this.gl.getAttribLocation(this.program, "vertPosition");
        const colorAttr = this.gl.getAttribLocation(this.program, "vertColor");

        this.gl.vertexAttribPointer(
            posAttr,
            3,
            this.gl.FLOAT,
            this.gl.FALSE,
            6 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.gl.vertexAttribPointer(
            colorAttr,
            3,
            this.gl.FLOAT,
            this.gl.FALSE,
            6 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );

        this.gl.enableVertexAttribArray(posAttr);
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
            [0, 0, -8],
            [0, 0, 0],
            [0, 1, 0]
        );
        mat4.perspective(
            this.projMatrix,
            glMatrix.toRadian(45),
            this.canvas.width / this.canvas.height,
            0.1,
            1000.0
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
        const xRotationMatrix = mat4.create();
        const yRotationMatrix = mat4.create();

        const loop = () => {
            angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
            mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
            mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
            mat4.mul(this.worldMatrix, yRotationMatrix, xRotationMatrix);
            this.gl.uniformMatrix4fv(
                this.matWorldUniform,
                this.gl.FALSE,
                this.worldMatrix
            );

            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.drawElements(
                this.gl.TRIANGLES,
                boxIndices.length,
                this.gl.UNSIGNED_SHORT,
                0
            );

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}

new Cubo3D("cubo3D");
