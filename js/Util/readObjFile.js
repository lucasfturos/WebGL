export class ReadObjectFile {
    constructor(filePath) {
        this.filePath = filePath;
        this.vertices = [];
        this.faces = [];
    }

    reset() {
        this.vertices = [];
        this.faces = [];
    }

    parseLine(line) {
        if (line.length === 0) {
            return;
        }

        const components = line.split(/ +/);
        const type = components[0];

        try {
            this[type].apply(this, components.slice(1));
        } catch (e) {
            console.warn('Tipo de comando obj desconhecido: "' + type + '"', e.toString());
        }
    }

    'v'(x, y, z) {
        this.vertices.push(+x, +y, +z, 1.0, 0.0, 0.0);
    }

    'f'(v1, v2, v3) {
        v1 = v1.split('/')[0];
        v2 = v2.split('/')[0];
        v3 = v3.split('/')[0];
        this.faces.push(+v1 - 1, +v2 - 1, +v3 - 1);
    }

    async loadFile() {
        try {
            const response = await fetch(this.filePath);
            const data = await response.text();

            this.reset();
            const lines = data.split('\n');
            lines.forEach(line => this.parseLine(line));

            return { vertices: this.vertices, faces: this.faces };
        } catch (err) {
            console.error('Erro ao carregar o arquivo: ', err);
            throw err;
        }
    }
}
