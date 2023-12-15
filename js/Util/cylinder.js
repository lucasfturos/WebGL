export const generateCylinderVertices = (
    height,
    radiusTop,
    radiusBottom,
    numSegments,
    color
) => {
    const vertices = [];
    const angleIncrement = (2 * Math.PI) / numSegments;

    for (let i = 0; i < numSegments; i++) {
        const angle = i * angleIncrement;
        const x = radiusTop * Math.cos(angle);
        const y = radiusTop * Math.sin(angle);
        vertices.push(x, y, height / 2, ...color.slice(0, 3));
    }

    for (let i = 0; i < numSegments; i++) {
        const angle = i * angleIncrement;
        const x = radiusBottom * Math.cos(angle);
        const y = radiusBottom * Math.sin(angle);
        vertices.push(x, y, -height / 2, ...color.slice(0, 3));
    }

    for (let i = 0; i < numSegments; i++) {
        const current = i;
        const next = (i + 1) % numSegments;

        vertices.push(
            radiusTop * Math.cos(i * angleIncrement),
            radiusTop * Math.sin(i * angleIncrement),
            height / 2,
            ...color.slice(0, 3)
        );
        vertices.push(
            radiusBottom * Math.cos(next * angleIncrement),
            radiusBottom * Math.sin(next * angleIncrement),
            -height / 2,
            ...color.slice(0, 3)
        );
    }

    return vertices;
};

export const generateCylinderIndices = (numSegments) => {
    const indices = [];

    for (let i = 0; i < numSegments; i++) {
        const current = i;
        const next = (i + 1) % numSegments;

        indices.push(current, next, current + numSegments);
        indices.push(next + numSegments, current + numSegments, next);
        indices.push(current, next, current + numSegments);
    }

    for (let i = 0; i < numSegments; i++) {
        indices.push(i, (i + 1) % numSegments, numSegments);
        indices.push(
            i + numSegments,
            ((i + 1) % numSegments) + numSegments,
            2 * numSegments + 1
        );

        indices.push(i, (i + 1) % numSegments, numSegments);
        indices.push(
            i + numSegments,
            ((i + 1) % numSegments) + numSegments,
            2 * numSegments + 1
        );
    }

    return indices;
};