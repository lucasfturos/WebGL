import {
    mat4,
    glMatrix,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm";

export class WebGL {
    constructor(canvasID) {
        this.canvas = document.getElementById(canvasID);
        this.gl =
            this.canvas.getContext("webgl") ||
            this.canvas.getContext("experimental-webgl");
        if (!this.gl) {
            alert("Your browser does not support WebGL");
            return;
        }
        const ext = this.gl.getExtension("OES_element_index_uint");
        if (!ext) {
            console.error(
                "OES_element_index_uint is not supported on this platform"
            );
        }
        this.setupWebGL();

        this.canvas.addEventListener("touchstart", (event) =>
            event.preventDefault()
        );
        this.canvas.addEventListener("touchmove", (event) =>
            event.preventDefault()
        );
        this.canvas.addEventListener("touchend", (event) =>
            event.preventDefault()
        );
    }

    setupWebGL() {
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.frontFace(this.gl.CCW);
        this.gl.cullFace(this.gl.BACK);
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(
                `ERROR compiling ${
                    type === this.gl.VERTEX_SHADER ? "vertex" : "fragment"
                } shader!`,
                this.gl.getShaderInfoLog(shader)
            );
            return null;
        }
        return shader;
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

    handleResize(width = window.innerWidth, height = 600) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    handleMouseControl(program, viewMatrix, matViewUniform) {
        let lastMouseX = null;
        let lastMouseY = null;
        this.canvas.addEventListener("mousemove", (event) => {
            const newX = event.clientX;
            const newY = event.clientY;
            if (lastMouseX && lastMouseY) {
                const deltaX = newX - lastMouseX;
                const deltaY = newY - lastMouseY;

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
                mat4.multiply(viewMatrix, viewMatrix, rotationMatrix);
                this.gl.useProgram(program);
                this.gl.uniformMatrix4fv(
                    matViewUniform,
                    this.gl.FALSE,
                    viewMatrix
                );
            }
            lastMouseX = newX;
            lastMouseY = newY;
        });
    }

    handleTouchControl(program, viewMatrix, matViewUniform) {
        let lastTouchX = null;
        let lastTouchY = null;
        this.canvas.addEventListener("touchstart", (event) => {
            lastTouchX = event.touches[0].clientX;
            lastTouchY = event.touches[0].clientY;
        });
        this.canvas.addEventListener("touchmove", (event) => {
            if (lastTouchX && lastTouchY) {
                const newX = event.touches[0].clientX;
                const newY = event.touches[0].clientY;

                const deltaX = newX - lastTouchX;
                const deltaY = newY - lastTouchY;

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
                mat4.multiply(viewMatrix, viewMatrix, rotationMatrix);
                this.gl.useProgram(program);
                this.gl.uniformMatrix4fv(
                    matViewUniform,
                    this.gl.FALSE,
                    viewMatrix
                );
                lastTouchX = newX;
                lastTouchY = newY;
            }
        });
        this.canvas.addEventListener("touchend", () => {
            lastTouchX = null;
            lastTouchY = null;
        });
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
        indices,
        vertexAttribs
    ) {
        vertexAttribs.forEach((attr) => {
            this.gl.enableVertexAttribArray(attr.location);
        });

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.vertexBuffer);
        vertexAttribs.forEach((attr) => {
            this.gl.vertexAttribPointer(
                attr.location,
                attr.size,
                attr.type,
                attr.normalized,
                attr.stride,
                attr.offset
            );
        });

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

        vertexAttribs.forEach((attr) => {
            this.gl.disableVertexAttribArray(attr.location);
        });
    }
}
