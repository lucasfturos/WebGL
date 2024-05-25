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
        this.lastMouseX = null;
        this.lastMouseY = null;
        this.rotationMatrix = mat4.create();

        if (this.object_indices && this.object_vertices) {
            this.setupShaders();
            this.setupBuffers();

            this.handleResize();
            window.addEventListener("resize", () => this.handleResize());
            this.setupMatrices();

            this.initMouseControl();
            this.initTouchControl();
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
    }

    setupBuffers() {
        this.objectBuffer = this.createBuffer(
            this.object_vertices,
            this.object_indices
        );
        const posAttr = this.gl.getAttribLocation(this.program, "vertPosition");
        if (posAttr === -1) {
            console.error(
                "Failed to get the attribute location for vertPosition."
            );
        } else {
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
        this.gl.enableVertexAttribArray(posAttr);
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
        this.gl.useProgram(this.program);
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

    initMouseControl() {
        this.canvas.addEventListener("mousemove", (event) => {
            const newX = event.clientX;
            const newY = event.clientY;

            if (this.lastMouseX !== null && this.lastMouseY !== null) {
                const deltaX = newX - this.lastMouseX;
                const deltaY = newY - this.lastMouseY;

                const rotationMatrix = mat4.create();
                mat4.rotate(
                    rotationMatrix,
                    rotationMatrix,
                    glMatrix.toRadian(deltaX / 5),
                    [0, 1, 0]
                );
                mat4.rotate(
                    rotationMatrix,
                    rotationMatrix,
                    glMatrix.toRadian(deltaY / 5),
                    [1, 0, 0]
                );

                mat4.multiply(this.viewMatrix, this.viewMatrix, rotationMatrix);

                this.gl.useProgram(this.program);
                this.gl.uniformMatrix4fv(
                    this.matViewUniform,
                    this.gl.FALSE,
                    this.viewMatrix
                );
            }

            this.lastMouseX = newX;
            this.lastMouseY = newY;
        });
    }

    initTouchControl() {
        this.canvas.addEventListener("touchstart", (event) => {
            this.lastTouchX = event.touches[0].clientX;
            this.lastTouchY = event.touches[0].clientY;
        });

        this.canvas.addEventListener("touchmove", (event) => {
            if (this.lastTouchX && this.lastTouchY) {
                const newX = event.touches[0].clientX;
                const newY = event.touches[0].clientY;

                const deltaX = newX - this.lastTouchX;
                const deltaY = newY - this.lastTouchY;

                const rotationMatrix = mat4.create();
                mat4.rotate(
                    rotationMatrix,
                    rotationMatrix,
                    glMatrix.toRadian(deltaX / 5),
                    [0, 1, 0]
                );
                mat4.rotate(
                    rotationMatrix,
                    rotationMatrix,
                    glMatrix.toRadian(deltaY / 5),
                    [1, 0, 0]
                );

                mat4.multiply(this.viewMatrix, this.viewMatrix, rotationMatrix);

                this.gl.useProgram(this.program);
                this.gl.uniformMatrix4fv(
                    this.matViewUniform,
                    this.gl.FALSE,
                    this.viewMatrix
                );

                this.lastTouchX = newX;
                this.lastTouchY = newY;
            }
        });

        this.canvas.addEventListener("touchend", () => {
            this.lastTouchX = null;
            this.lastTouchY = null;
        });
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
