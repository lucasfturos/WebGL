export class ReadObjectFile {
    constructor(filePath, fileData) {
        this.filePath = filePath;
        this.fileData = fileData;
        this.vertices = [];
        this.faces = [];
        this.texture = [];
        this.normal = [];
    }

    reset() {
        this.vertices = [];
        this.faces = [];
        this.texture = [];
        this.normal = [];
    }

    parseLine(line) {
        if (line.length === 0 || line.startsWith("#")) {
            return;
        }

        const components = line.split(/ +/);
        const type = components[0];

        try {
            this[type].apply(this, components.slice(1));
        } catch (e) {
            console.warn(
                'Tipo de comando obj desconhecido: "' + type + '"',
                e.toString()
            );
        }
    }

    v(x, y, z) {
        this.vertices.push(+x, +y, +z, 1.0, 0.0, 0.0);
    }

    f(v1, v2, v3) {
        v1 = v1.split("/")[0];
        v2 = v2.split("/")[0];
        v3 = v3.split("/")[0];
        this.faces.push(+v1 - 1, +v2 - 1, +v3 - 1);
    }

    vt(u, v) {
        this.texture.push(+u, +v);
    }

    vn(x, y, z) {
        this.normal.push(+x, +y, +z);
    }

    async loadFile() {
        try {
            let data;
            if (this.filePath && !this.fileData) {
                const response = await fetch(this.filePath);
                data = await response.text();
            } else if (!this.filePath && this.fileData) {
                data = this.fileData;
            } else {
                throw new Error(
                    "Nenhum caminho de arquivo ou dados fornecidos."
                );
            }
            this.reset();
            const lines = data.split("\n");
            lines.forEach((line) => this.parseLine(line));
            return { vertices: this.vertices, faces: this.faces };
        } catch (err) {
            console.error("Erro ao carregar o arquivo: ", err);
            throw err;
        }
    }
}
