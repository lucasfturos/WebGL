import { WebGL } from "../app.js";
import { Sphere } from "../Util/sphere.js";
import { Cylinder } from "../Util/cylinder.js";
import {
    vertexShaderSrc, fragmentShaderSrc
} from "../Shader/casquinha.js";
import {
    glMatrix,
    mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm";

class Casquinha extends WebGL {
    constructor(canvasID) {
        super(canvasID);

        // Setup WebGL
        this.setupShaders();
        this.setupBuffers();
        this.setupTextureIce();
        this.setupTextureWaffle();
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

        this.mWorldUniform = this.gl.getUniformLocation(
            this.program,
            "mWorld"
        );
        this.mViewUniform = this.gl.getUniformLocation(
            this.program,
            "mView"
        );
        this.mProjUniform = this.gl.getUniformLocation(
            this.program,
            "mProj"
        );

    }

    setupBuffersCone() {
        // Setup Cone
        const radiusTop = 2.0;
        const radiusBottom = 0.0;
        this.coneHeight = 4.5;
        const coneSegment = 20;
        const cylinder = new Cylinder(
            this.coneHeight,
            radiusTop,
            radiusBottom,
            coneSegment,
            [],
            true
        );
        this.coneVertices = cylinder.vertices;
        this.coneIndices = cylinder.indices;

        this.coneVertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.coneVertexBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(this.coneVertices),
            this.gl.DYNAMIC_DRAW
        );

        this.coneIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.coneIndexBuffer);
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.coneIndices),
            this.gl.DYNAMIC_DRAW
        );
    }

    setupBuffersSphere() {
        // Setup Esfera
        this.radiusSphere = 2;
        const numSegments = 20;
        const sphere = new Sphere(this.radiusSphere, numSegments, [], true);
        this.sphereVertices = sphere.vertices;
        this.sphereIndices = sphere.indices;

        this.sphereVertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sphereVertexBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(this.sphereVertices),
            this.gl.STATIC_DRAW
        );

        this.sphereIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(
            this.gl.ELEMENT_ARRAY_BUFFER,
            this.sphereIndexBuffer
        );
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.sphereIndices),
            this.gl.STATIC_DRAW
        );
    }

    setupBuffers() {
        this.setupBuffersSphere();
        this.setupBuffersCone();

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
            3 * Float32Array.BYTES_PER_ELEMENT
        );

        this.gl.enableVertexAttribArray(posAttr);
        this.gl.enableVertexAttribArray(texCoordAttr);
    }


    setupTextureIce() {
        this.iceTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.iceTexture);
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
            document.getElementById("ice-cream")
        );
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    setupTextureWaffle() {
        this.coneTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.coneTexture);
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
            document.getElementById("waffle")
        );
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    setupMatrices() {
        this.worldMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();

        mat4.lookAt(
            this.viewMatrix,
            [0.0, -12.0, 0.0],
            [0.0, 0.0, 2.5],
            [0.0, 0.0, 1.0]

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
        const rotationAxis = [0, 0, 1];
        const identityMatrix = mat4.create();
        const rotationMatrix = mat4.create();

        const loop = () => {
            angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
            angle *= -1;

            mat4.rotate(rotationMatrix, identityMatrix, angle, rotationAxis);
            mat4.identity(this.worldMatrix);
            mat4.mul(this.worldMatrix, this.worldMatrix, rotationMatrix);

            this.gl.uniformMatrix4fv(this.mWorldUniform, this.gl.FALSE, this.worldMatrix);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            // Renderiza o sorvete
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.iceTexture);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.drawElements(this.gl.TRIANGLES, this.sphereIndices.length, this.gl.UNSIGNED_SHORT, 0);

            // Renderiza a casquinha
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.coneTexture);
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.drawElements(this.gl.TRIANGLES, this.coneIndices.length, this.gl.UNSIGNED_SHORT, 0);

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

}

new Casquinha("casquinha-sorvete");
