export const vertexShaderSrc = `
precision mediump float;

attribute vec3 vPosition;
attribute vec2 vTexCoord;

varying vec2 fragTexCoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fragTexCoord = vTexCoord;
    gl_Position = mProj * mView * mWorld * vec4(vPosition, 1.0);
}
`;

export const fragmentShaderSrc = `
precision mediump float;

varying vec2 fragTexCoord;
uniform sampler2D sampler;

void main() {
    gl_FragColor = texture2D(sampler, fragTexCoord);
}
`;