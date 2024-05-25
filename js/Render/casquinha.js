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

        this.setupShaders();
        this.setupBufferSphere();
        this.setupBufferCone();
        this.setupTexture();
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

    setupBufferSphere() {
        // Setup Esfera
        const radiusSphere = 2.0;
        const numSegments = 20;
        const sphere = new Sphere(radiusSphere, numSegments, [], true);
        this.sphereVertices = sphere.vertices;
        this.sphereIndices = sphere.indices;
        this.sphereBuffers = this.createBuffer(
            this.sphereVertices,
            this.sphereIndices
        );
    }

    setupBufferCone() {
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
        this.coneBuffers = this.createBuffer(
            this.coneVertices,
            this.coneIndices
        );
    }

    setupTexture() {
        this.iceTexture = this.loadTexture("ice-cream");
        this.coneTexture = this.loadTexture("waffle");
    }

    setupMatrices() {
        this.worldMatrixSphere = mat4.create();
        this.viewMatrixSphere = mat4.create();
        this.projMatrixSphere = mat4.create();
        mat4.lookAt(
            this.viewMatrixSphere,
            [0.0, -13.0, 0.0],
            [0.0, 0.0, -0.8],
            [0.0, 0.0, 1.0]
        );
        mat4.perspective(
            this.projMatrixSphere,
            glMatrix.toRadian(45),
            this.canvas.width / this.canvas.height,
            0.01,
            100.0
        );

        this.worldMatrixCone = mat4.create();
        this.viewMatrixCone = mat4.create();
        this.projMatrixCone = mat4.create();
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
        const vertexAttribs = [
            {
                location: this.posAttr,
                size: 3,
                type: this.gl.FLOAT,
                normalized: this.gl.FALSE,
                stride: 5 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
            },
            {
                location: this.texCoordAttr,
                size: 2,
                type: this.gl.FLOAT,
                normalized: this.gl.FALSE,
                stride: 5 * Float32Array.BYTES_PER_ELEMENT,
                offset: 3 * Float32Array.BYTES_PER_ELEMENT,
            },
        ];

        const loop = () => {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            const angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
            const rotationAxis = [0, 0, 1];

            // Renderizar a esfera
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
                this.sphereIndices,
                vertexAttribs
            );

            // // Renderizar o cone
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
                this.coneIndices,
                vertexAttribs
            );
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

new Casquinha("casquinha-sorvete");
