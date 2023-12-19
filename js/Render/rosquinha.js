import { WebGL } from "../app.js";
import { Torus } from "../Util/torus.js";
import { vertexShaderSrc, fragmentShaderSrc } from "../Shader/rosquinha.js";
import {
    glMatrix,
    mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm";

class Rosquinha extends WebGL {
    constructor(canvasID) {
        super(canvasID);

        // Setup torus
        const innerRadius = 0.6;
        const outerRadius = 0.8;
        const numSegments = 50;
        const torus = new Torus(innerRadius, outerRadius, numSegments, [], true);
        this.torusVertices = torus.vertices;
        this.torusIndices = torus.indices;

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

        this.mWorldUniform = this.gl.getUniformLocation(this.program, "mWorld");
        this.mViewUniform = this.gl.getUniformLocation(this.program, "mView");
        this.mProjUniform = this.gl.getUniformLocation(this.program, "mProj");
    }

    setupBuffers() {
        const vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(this.torusVertices),
            this.gl.STATIC_DRAW
        );

        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.torusIndices),
            this.gl.STATIC_DRAW
        );

        const posAttr = this.gl.getAttribLocation(this.program, "vertPosition");
        const texCoordAttr = this.gl.getAttribLocation(this.program, "vertTexCoord");

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
            2 * Float32Array.BYTES_PER_ELEMENT
        );

        this.gl.enableVertexAttribArray(posAttr);
        this.gl.enableVertexAttribArray(texCoordAttr);
    }

    setupTexture() {
        this.torusTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.torusTexture);
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
            document.getElementById("donut")
        );
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    setupMatrices() {
        this.worldMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();

        mat4.lookAt(
            this.viewMatrix,
            [0.0, 0.0, -4.5],
            [0.0, 0.0, 0.0],
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
            this.mViewUniform,
            this.gl.FALSE,
            this.viewMatrix
        );
        this.gl.uniformMatrix4fv(
            this.mProjUniform,
            this.gl.FALSE,
            this.projMatrix
        );
    }

    render() {
        let angle = 0.0;
        const rotationAxis = [1, 1, 1];
        const identityMatrix = mat4.create();
        const rotationMatrix = mat4.create();

        const loop = () => {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
            angle *= -1;

            mat4.identity(this.worldMatrix);
            mat4.rotate(rotationMatrix, identityMatrix, angle, rotationAxis);
            mat4.mul(this.worldMatrix, this.worldMatrix, rotationMatrix);

            this.gl.uniformMatrix4fv(
                this.mWorldUniform,
                this.gl.FALSE,
                this.worldMatrix
            );

            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            this.gl.bindTexture(this.gl.TEXTURE_2D, this.torusTexture);
            this.gl.activeTexture(this.gl.TEXTURE0);

            this.gl.drawElements(
                this.gl.TRIANGLES,
                this.torusIndices.length,
                this.gl.UNSIGNED_SHORT,
                0
            );

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

new Rosquinha("rosquinha");
