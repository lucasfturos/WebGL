export class WebGL {
    constructor(canvasID) {
        this.canvas = document.getElementById(canvasID);
        this.gl =
            this.canvas.getContext('webgl') ||
            this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            alert('Your browser does not support WebGL');
            return;
        }

        this.setupWebGL();
        this.setupShaders();
        this.setupBuffers();
        this.setupMatrices();
        this.render();
    }

    setupWebGL() {
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.frontFace(this.gl.CCW);
        this.gl.cullFace(this.gl.BACK);
    }

    setupShaders() { }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(
                `ERROR compiling ${type === this.gl.VERTEX_SHADER ? "vertex" : "fragment"
                } shader!`,
                this.gl.getShaderInfoLog(shader)
            );
            return null;
        }
        return shader;
    }

    setupBuffers() { }

    setupMatrices() { }

    render() { }
}