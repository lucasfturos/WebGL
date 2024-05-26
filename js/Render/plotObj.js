import { WebGL } from "../app.js";
import { vertexShaderSrc, fragmentShaderSrc } from "../Shader/plotObj.js";
import {
    glMatrix,
    mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm";

export class PlotObj extends WebGL {
    constructor(canvasID, vertices, indices, scale) {
        super(canvasID);

        this.object_indices = indices;
        this.object_vertices = vertices;
        this.scale = scale;
        this.rotationMatrix = mat4.create();

        if (this.object_indices && this.object_vertices) {
            this.setupShaders();
            this.setupBuffers();

            this.handleResize();
            window.addEventListener("resize", () => this.handleResize());
            this.setupMatrices();
            this.render();
        } else {
            console.error("Error loading teapot data.");
        }
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
        this.matWorldUniform = this.gl.getUniformLocation(
            this.program,
            "mWorld"
        );
        this.matViewUniform = this.gl.getUniformLocation(this.program, "mView");
        this.matProjUniform = this.gl.getUniformLocation(this.program, "mProj");
        if (
            this.matWorldUniform === -1 ||
            this.matViewUniform === -1 ||
            this.matProjUniform === -1
        ) {
            console.error(
                "Failed to get the location of one or more uniforms."
            );
        }
        this.gl.useProgram(this.program);
    }

    setupBuffers() {
        this.objectBuffer = this.createBuffer(
            this.object_vertices,
            this.object_indices
        );
        const posAttr = this.gl.getAttribLocation(this.program, "vertPosition");
        this.gl.enableVertexAttribArray(posAttr);
        this.gl.vertexAttribPointer(
            posAttr,
            3,
            this.gl.FLOAT,
            this.gl.FALSE,
            6 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
    }

    setupMatrices() {
        this.worldMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();

        mat4.lookAt(
            this.viewMatrix,
            [0.0, 3.5, 10.0],
            [0.0, 1.5, 0.0],
            [0.0, 1.0, 0.0]
        );

        mat4.perspective(
            this.projMatrix,
            glMatrix.toRadian(60),
            this.canvas.width / this.canvas.height,
            0.1,
            100.0
        );

        this.handleMouseControl(
            this.program,
            this.viewMatrix,
            this.matViewUniform
        );
        this.handleTouchControl(
            this.program,
            this.viewMatrix,
            this.matViewUniform
        );

        this.gl.uniformMatrix4fv(
            this.matProjUniform,
            this.gl.FALSE,
            this.projMatrix
        );
        this.gl.uniformMatrix4fv(
            this.matViewUniform,
            this.gl.FALSE,
            this.viewMatrix
        );
    }

    updateScale(newScale) {
        this.scale = newScale;
    }

    render() {
        const loop = () => {
            let angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
            angle *= -1;
            mat4.identity(this.worldMatrix);

            const rotationAxis = [0, 1, 0];
            const scaleAxis = [this.scale, this.scale, this.scale];

            mat4.rotate(
                this.worldMatrix,
                this.worldMatrix,
                angle,
                rotationAxis
            );
            mat4.scale(this.worldMatrix, this.worldMatrix, scaleAxis);
            mat4.multiply(
                this.worldMatrix,
                this.worldMatrix,
                this.rotationMatrix
            );

            this.gl.useProgram(this.program);
            this.gl.uniformMatrix4fv(
                this.matWorldUniform,
                this.gl.FALSE,
                this.worldMatrix
            );

            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.enable(this.gl.CULL_FACE);

            this.gl.drawElements(
                this.gl.TRIANGLES,
                this.object_indices.length,
                this.gl.UNSIGNED_SHORT,
                0
            );
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}
