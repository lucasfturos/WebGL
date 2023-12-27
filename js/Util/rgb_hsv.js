export const RGBtoHSVWithAlpha = (r, g, b, a) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    const h =
        max === min
            ? 0
            : max === r
                ? (g - b + d * (g < b ? 6 : 0)) / (6 * d)
                : max === g
                    ? (b - r + d * 2) / (6 * d)
                    : (r - g + d * 4) / (6 * d);

    const s = max === 0 ? 0 : d / max;
    const v = max;

    return [h, s, v, a];
};

export const HSVtoRGBWithAlpha = (h, s, v, a) => {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: (r = v), (g = t), (b = p); break;
        case 1: (r = q), (g = v), (b = p); break;
        case 2: (r = p), (g = v), (b = t); break;
        case 3: (r = p), (g = q), (b = v); break;
        case 4: (r = t), (g = p), (b = v); break;
        case 5: (r = v), (g = p), (b = q); break;
    }

    return [r, g, b, a];
};
