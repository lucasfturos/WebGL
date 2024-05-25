import { WebGL } from "../app.js";
import { Cylinder } from "../Util/cylinder.js";
import {
    glMatrix,
    mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm";
import { vertexShaderSrc, fragmentShaderSrc } from "../Shader/coneHSV.js";

class ConeHSV extends WebGL {
    constructor(canvasID) {
        super(canvasID);

        // Setup Object
        const radiusTop = 0.0;
        const radiusBottom = 2.0;
        this.coneHeight = 4.5;
        const coneSlices = 20;
        const cylinder = new Cylinder(
            this.coneHeight,
            radiusTop,
            radiusBottom,
            coneSlices
        );

        this.coneVertices = cylinder.vertices;
        this.coneIndices = cylinder.indices;

        // Setup WebGL
        this.setupShaders();
        this.setupBuffers();
        this.handleResize();
        window.addEventListener("resize", () => this.handleResize());
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

        const heightUniform = this.gl.getUniformLocation(
            this.program,
            "height"
        );
        this.gl.uniform1f(heightUniform, this.coneHeight);
        this.matWorldUniform = this.gl.getUniformLocation(
            this.program,
            "mWorld"
        );
        this.matViewUniform = this.gl.getUniformLocation(this.program, "mView");
        this.matProjUniform = this.gl.getUniformLocation(this.program, "mProj");
    }

    setupBuffers() {
        const coneVertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, coneVertexBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(this.coneVertices),
            this.gl.STATIC_DRAW
        );

        const coneIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.coneIndices),
            this.gl.STATIC_DRAW
        );

        const posAttr = this.gl.getAttribLocation(this.program, "vPosition");
        const colorAttr = this.gl.getAttribLocation(this.program, "vColor");

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
        this.worldMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();

        mat4.lookAt(this.viewMatrix, [0, -12, 0], [0, 0, 0], [0, 0, -1]);

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
        const rotationAxis = [1, 0, 1];
        const identityMatrix = mat4.create();
        const rotationMatrix = mat4.create();

        const loop = () => {
            angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
            angle *= -1;

            mat4.rotate(rotationMatrix, identityMatrix, angle, rotationAxis);
            mat4.mul(this.worldMatrix, rotationMatrix, identityMatrix);

            this.gl.uniformMatrix4fv(
                this.matWorldUniform,
                this.gl.FALSE,
                this.worldMatrix
            );

            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.drawElements(
                this.gl.TRIANGLES,
                this.coneIndices.length,
                this.gl.UNSIGNED_SHORT,
                0
            );

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

new ConeHSV("cone-hsv");
