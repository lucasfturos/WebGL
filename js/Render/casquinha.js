import { WebGL } from "../app.js";
import { Sphere } from "../Util/sphere.js";
import { Cylinder } from "../Util/cylinder.js";
import {
    glMatrix,
    mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm";
import { vertexShaderSrc, fragmentShaderSrc } from "../Shader/casquinha.js";

class Casquinha extends WebGL {
    constructor(canvasID) {
        super(canvasID);

        // Setup WebGL
        this.setupShaders();
        this.setupBuffers();
        this.setupTexture();
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

        this.posAttr = this.gl.getAttribLocation(this.program, "vPosition");
        this.texCoordAttr = this.gl.getAttribLocation(
            this.program,
            "vTexCoord"
        );

        this.mWorldUniform = this.gl.getUniformLocation(this.program, "mWorld");
        this.mViewUniform = this.gl.getUniformLocation(this.program, "mView");
        this.mProjUniform = this.gl.getUniformLocation(this.program, "mProj");
        this.iceCreamTextureUniform = this.gl.getUniformLocation(
            this.program,
            "iceCreamTexture"
        );
        this.coneTextureUniform = this.gl.getUniformLocation(
            this.program,
            "coneTexture"
        );

        this.gl.uniform1i(this.iceCreamTextureUniform, 0);
        this.gl.uniform1i(this.coneTextureUniform, 1);
    }

    createBuffer(vertices, indices) {
        const vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            this.gl.STATIC_DRAW
        );

        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            this.gl.STATIC_DRAW
        );

        return { vertexBuffer, indexBuffer };
    }

    setupBuffers() {
        // Setup Esfera
        this.radiusSphere = 2;
        const numSegments = 20;
        const sphere = new Sphere(this.radiusSphere, numSegments, [], true);
        this.sphereVertices = sphere.vertices;
        this.sphereIndices = sphere.indices;

        // Setup Cone
        const radiusTop = 2.0;
        const radiusBottom = 0.0;
        const coneHeight = 4.5;
        const coneSegment = 20;
        const cylinder = new Cylinder(
            coneHeight,
            radiusTop,
            radiusBottom,
            coneSegment,
            [],
            true
        );
        this.coneVertices = cylinder.vertices;
        this.coneIndices = cylinder.indices;

        this.sphereBuffers = this.createBuffer(
            this.sphereVertices,
            this.sphereIndices
        );

        this.coneBuffers = this.createBuffer(
            this.coneVertices,
            this.coneIndices
        );

        this.gl.vertexAttribPointer(
            this.posAttr,
            3,
            this.gl.FLOAT,
            this.gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.gl.vertexAttribPointer(
            this.texCoordAttr,
            2,
            this.gl.FLOAT,
            this.gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
    }

    setupTexture() {
        this.iceTexture = this.loadTexture("ice-cream");
        this.coneTexture = this.loadTexture("waffle");
    }

    loadTexture(id) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_S,
            this.gl.REPEAT
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_T,
            this.gl.REPEAT
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
            document.getElementById(id)
        );

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        return texture;
    }

    setupMatrices() {
        this.worldMatrixSphere = mat4.create();
        this.viewMatrixSphere = mat4.create();
        this.projMatrixSphere = mat4.create();

        this.worldMatrixCone = mat4.create();
        this.viewMatrixCone = mat4.create();
        this.projMatrixCone = mat4.create();

        mat4.lookAt(
            this.viewMatrixSphere,
            [0.0, -12.0, 0.0],
            [0.0, 0.0, -1.9],
            [0.0, 0.0, 1.0]
        );
        mat4.perspective(
            this.projMatrixSphere,
            glMatrix.toRadian(45),
            this.canvas.width / this.canvas.height,
            0.01,
            100.0
        );

        mat4.lookAt(
            this.viewMatrixCone,
            [0.0, -9.0, 0.0],
            [0.0, 0.0, 2.5],
            [0.0, 0.0, 1.0]
        );
        mat4.perspective(
            this.projMatrixCone,
            glMatrix.toRadian(60),
            this.canvas.width / this.canvas.height,
            0.01,
            100.0
        );
    }

    render() {
        const identityMatrix = mat4.create();
        const rotationMatrix = mat4.create();

        const loop = () => {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            const angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
            const rotationAxis = [0, 0, 1];

            this.renderObject(
                this.sphereBuffers,
                this.worldMatrixSphere,
                this.projMatrixSphere,
                this.viewMatrixSphere,
                this.iceTexture,
                angle,
                rotationAxis,
                identityMatrix,
                rotationMatrix,
                this.sphereIndices
            );
            this.renderObject(
                this.coneBuffers,
                this.worldMatrixCone,
                this.projMatrixCone,
                this.viewMatrixCone,
                this.coneTexture,
                angle,
                rotationAxis,
                identityMatrix,
                rotationMatrix,
                this.coneIndices
            );

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    renderObject(
        buffer,
        worldMatrix,
        projMatrix,
        viewMatrix,
        texture,
        angle,
        rotationAxis,
        identityMatrix,
        rotationMatrix,
        indices
    ) {
        this.gl.enableVertexAttribArray(this.posAttr);
        this.gl.enableVertexAttribArray(this.texCoordAttr);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.vertexBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);

        mat4.rotate(rotationMatrix, identityMatrix, angle, rotationAxis);
        mat4.identity(worldMatrix);
        mat4.mul(worldMatrix, worldMatrix, rotationMatrix);

        this.gl.uniformMatrix4fv(
            this.mWorldUniform,
            this.gl.FALSE,
            worldMatrix
        );
        this.gl.uniformMatrix4fv(this.mViewUniform, this.gl.FALSE, viewMatrix);
        this.gl.uniformMatrix4fv(this.mProjUniform, this.gl.FALSE, projMatrix);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.drawElements(
            this.gl.TRIANGLES,
            indices.length,
            this.gl.UNSIGNED_SHORT,
            0
        );

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

        this.gl.disableVertexAttribArray(this.posAttr);
        this.gl.disableVertexAttribArray(this.texCoordAttr);
    }
}

new Casquinha("casquinha-sorvete");
