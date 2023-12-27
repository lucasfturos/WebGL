export const vertexShaderSrc = `
precision mediump float;

attribute vec3 vPosition;
attribute vec3 vColor;

varying vec3 fColor;
varying vec3 fPosition;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fPosition = vPosition;
    fColor = vColor;
    gl_Position = mProj * mView * mWorld * vec4(vPosition, 1.0);
}
`;

export const fragmentShaderSrc = `
precision mediump float;

varying vec3 fColor;
varying vec3 fPosition;

uniform float height;

const float PI = ${Math.PI};
const float TWO_PI = ${2.0 * Math.PI};

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void) {
    float angle = atan(fPosition.y, fPosition.x) + PI;
    angle /= TWO_PI;
    float d = distance(fPosition.xy, fPosition.xz);

    float normalizedHeight = fPosition.z / height;
    normalizedHeight = clamp(normalizedHeight, 0.0, 1.0);

    float saturation = d / height;
    saturation = max(1.0, saturation);
    float value = 1.0 - normalizedHeight;

    float smoothFactor = smoothstep(0.0, 1.0, normalizedHeight);

    vec3 hsvColor = vec3(angle, saturation, value) * value;
    vec3 rgbColor = hsv2rgb(hsvColor);

    gl_FragColor = vec4(rgbColor, value);
}
`;