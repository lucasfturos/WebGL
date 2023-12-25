import { WebGL } from "../app.js";
import { boxIndices, boxVerticesUV } from "../Util/box.js";
import {
    glMatrix,
    mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm";
import { vertexShaderSrc, fragmentShaderSrc } from "../Shader/caixote3D.js";

export class Caixote3D extends WebGL {
    constructor(canvasID) {
        super(canvasID);

        this.setupShaders();
        this.setupBuffers();
        this.setupTexture();
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
        const boxVertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boxVertexBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(boxVerticesUV),
            this.gl.STATIC_DRAW
        );

        const boxIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, boxIndexBuffer);
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(boxIndices),
            this.gl.STATIC_DRAW
        );

        const posAttr = this.gl.getAttribLocation(
            this.program,
            "vertPosition"
        );
        const texCoordAttr = this.gl.getAttribLocation(
            this.program,
            "vertTexCoord"
        );

        this.gl.vertexAttribPointer(
            posAttr,
            3,
            this.gl.FLOAT,
            this.gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.gl.vertexAttribPointer(
            texCoordAttr,
            2,
            this.gl.FLOAT,
            this.gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );

        this.gl.enableVertexAttribArray(posAttr);
        this.gl.enableVertexAttribArray(texCoordAttr);
    }

    setupTexture() {
        this.boxTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.boxTexture);
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_S,
            this.gl.CLAMP_TO_EDGE
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_T,
            this.gl.CLAMP_TO_EDGE
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MIN_FILTER,
            this.gl.LINEAR
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MAG_FILTER,
            this.gl.LINEAR
        );
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            document.getElementById("crate-image")
        );
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    setupMatrices() {
        this.matWorldUniform = this.gl.getUniformLocation(
            this.program,
            "mWorld"
        );
        this.matViewUniform = this.gl.getUniformLocation(
            this.program,
            "mView"
        );
        this.matProjUniform = this.gl.getUniformLocation(
            this.program,
            "mProj"
        );

        this.worldMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();

        mat4.lookAt(this.viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
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

        angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
        mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        mat4.mul(this.worldMatrix, yRotationMatrix, xRotationMatrix);
        this.gl.uniformMatrix4fv(
            this.matWorldUniform,
            this.gl.FALSE,
            this.worldMatrix
        );

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.boxTexture);
        this.gl.activeTexture(this.gl.TEXTURE0);

        this.gl.drawElements(
            this.gl.TRIANGLES,
            boxIndices.length,
            this.gl.UNSIGNED_SHORT,
            0
        );
        requestAnimationFrame(() => this.render());
    }
}

new Caixote3D('caixote3D');
