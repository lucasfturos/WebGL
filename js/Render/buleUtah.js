import { WebGL } from "../app.js";
import { ReadObjectFile } from "../Util/readObjFile.js";
import { vertexShaderSrc, fragmentShaderSrc } from "../Shader/buleUtah.js";
import {
    glMatrix,
    mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm";


class BuleUtah extends WebGL {
    constructor(canvasID, vertices, indices) {
        super(canvasID);

        this.teapot_indices = indices;
        this.teapot_vertices = vertices;

        if (this.teapot_indices && this.teapot_vertices) {
            this.setupShaders();
            this.setupBuffers();
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

        this.gl.useProgram(this.program);
    }

    setupBuffers() {
        const vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(this.teapot_vertices),
            this.gl.STATIC_DRAW
        );

        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.teapot_indices),
            this.gl.STATIC_DRAW
        );

        const positionAttr = this.gl.getAttribLocation(
            this.program,
            "vertPosition"
        );

        this.gl.vertexAttribPointer(
            positionAttr,
            3,
            this.gl.FLOAT,
            this.gl.FALSE,
            6 * Float32Array.BYTES_PER_ELEMENT,
            0
        );

        this.gl.enableVertexAttribArray(positionAttr);
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
            [0.0, 0.0, 11.0],
            [0.0, 2.0, 0.0],
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
        const identityMatrix = mat4.create();
        const yRotationMatrix = mat4.create();
        const loop = () => {
            let angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
            angle *= -1;

            mat4.identity(this.worldMatrix);
            mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 1]);
            mat4.mul(this.worldMatrix, yRotationMatrix, identityMatrix);

            this.gl.uniformMatrix4fv(
                this.matWorldUniform,
                this.gl.FALSE,
                this.worldMatrix
            );
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.enable(this.gl.CULL_FACE);

            this.gl.drawElements(
                this.gl.TRIANGLES,
                this.teapot_indices.length,
                this.gl.UNSIGNED_SHORT,
                0
            );

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}

(async () => {
    try {
        const { vertices, faces } = await new ReadObjectFile("./obj/teapot.obj").loadFile();
        new BuleUtah("bule", vertices, faces);
    } catch (err) {
        console.error("Erro ao carregar o arquivo: ", err);
    }
})();