export const vertexShaderSrc = `
precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform float height;

// Função para converter HSV para RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    // Ajustando a orientação e a posição da cor
    float colorTransition = vertPosition.y / height;
    
    // Convertendo o espectro de cores HSV para RGB
    vec3 hsvColor = vec3(colorTransition, 1.0, 1.0);
    vec3 rgbColor = hsv2rgb(hsvColor);

    fragColor = rgbColor;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
`;

export const fragmentShaderSrc = `
precision mediump float;

varying vec3 fragColor;

void main(void) {
    gl_FragColor = vec4(fragColor, 1.0);
}
`;
