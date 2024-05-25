import { ReadObjectFile } from "../Util/readObjFile.js";
import { PlotObj } from "../Render/plotObj.js";

const fileTypeSelect = document.getElementById("file-type");
const localFileDiv = document.getElementById("local-file");
const urlFileDiv = document.getElementById("url-file");
const localFileInput = document.getElementById("input-file");
const urlFileInput = document.getElementById("input-url");
const loadFileBtn = document.getElementById("load-file-btn");

const inputScaleValue = document.getElementById("input-scale-range");
const scaleValueLabel = document.getElementById("scale-value");

localFileInput.addEventListener("change", () => {
    if (localFileInput.files.length > 0) {
        const file = localFileInput.files[0];
        const fileDirectorySpan = document.querySelector(".file-directory");
        fileDirectorySpan.textContent = file.webkitRelativePath || file.name;
    }
});

const toggleFileFields = () => {
    const value = fileTypeSelect.value;
    localFileDiv.style.display = value === "local" ? "block" : "none";
    urlFileDiv.style.display = value === "url" ? "block" : "none";
    loadFileBtn.style.display = value === "default" ? "none" : "block";
};
fileTypeSelect.addEventListener("change", toggleFileFields);
window.addEventListener("DOMContentLoaded", () => {
    fileTypeSelect.value = "default";
    toggleFileFields();
});

const loadFileFromURL = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Erro ao carregar o arquivo a partir da URL");
        }
        const content = await response.text();
        const objFile = new ReadObjectFile(null, content);
        const { vertices, faces } = await objFile.loadFile();
        return { vertices, faces };
    } catch (error) {
        console.error("Erro ao carregar o arquivo da URL:", error);
    }
};

const loadDefaultObj = async () => {
    try {
        const objFile = new ReadObjectFile("/WebGL/obj/teapot.obj", null);
        // const objFile = new ReadObjectFile("../../obj/teapot.obj", null);
        const { vertices, faces } = await objFile.loadFile();
        return { vertices, faces };
    } catch (error) {
        console.error("Erro ao carregar o arquivo padrão:", error);
    }
};

const loadObj = async () => {
    let plotObj;
    let objFile;
    let vertices, faces;
    inputScaleValue.addEventListener("input", () => {
        const scale = parseFloat(inputScaleValue.value);
        scaleValueLabel.textContent = scale;
        if (plotObj) {
            plotObj.updateScale(scale);
        }
    });

    try {
        const value = fileTypeSelect.value;
        if (value === "local" && localFileInput.files.length > 0) {
            const file = await localFileInput.files[0];
            const url = URL.createObjectURL(file);
            objFile = new ReadObjectFile(url, null);
            ({ vertices, faces } = await objFile.loadFile());
        } else if (value === "url") {
            const url = urlFileInput.value;
            ({ vertices, faces } = await loadFileFromURL(url));
        } else if (value === "default") {
            ({ vertices, faces } = await loadDefaultObj());
        }
        if (vertices && faces) {
            const scale = parseFloat(inputScaleValue.value);
            plotObj = new PlotObj("plotObj", vertices, faces, scale);
        } else {
            console.error("Erro ao carregar os dados do arquivo.");
        }
    } catch (err) {
        console.error("Erro ao carregar o arquivo: ", err);
    }
};

loadFileBtn.addEventListener("click", loadObj);
loadObj();
