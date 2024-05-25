export const vertexShaderSrc = `
precision mediump float;

attribute vec3 vertPosition;

varying vec3 fragPosition;
varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fragColor = vec3(vertPosition.x, vertPosition.y, vertPosition.z) * 0.5;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
`;

export const fragmentShaderSrc = `
precision mediump float;

varying vec3 fragColor;

void main() {
    gl_FragColor = vec4(fragColor, 0.1);
}
`;