import { ofArray, iterate } from "../../fable_modules/fable-library-js.4.25.0/List.js";

export function render() {
    const wrapper = document.createElement("div");
    wrapper.className = "w-full max-w-4xl flex flex-col md:flex-row gap-4";
    const buttonsBox = document.createElement("div");
    buttonsBox.className = "flex-1 bg-white p-4 rounded shadow border border-gray-300 flex flex-col gap-2";
    const btnTrain = document.createElement("button");
    btnTrain.className = "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700";
    btnTrain.textContent = "Train";
    btnTrain.id = "btn-train";
    const btnReset = document.createElement("button");
    btnReset.className = "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700";
    btnReset.textContent = "Reset";
    btnReset.id = "btn-reset";
    const btnRandom = document.createElement("button");
    btnRandom.className = "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700";
    btnRandom.textContent = "Random weight";
    btnRandom.id = "btn-random";
    const csvInput = document.createElement("input");
    csvInput.setAttribute("type", "file");
    csvInput.setAttribute("accept", ".csv");
    csvInput.className = "px-2 py-1 border rounded text-sm";
    csvInput.id = "csv-input";
    iterate((arg) => {
        buttonsBox.appendChild(arg);
    }, ofArray([btnTrain, btnReset, btnRandom, csvInput]));
    const settingsBox = document.createElement("div");
    settingsBox.className = "flex-1 bg-white p-4 rounded shadow border border-gray-300";
    settingsBox.id = "settings-box";
    const html = "\r\n    <div class=\"text-sm text-gray-800 space-y-2\">\r\n      <label class=\"block\">\r\n        <span class=\"text-gray-600 font-medium\">Learning rate: <span id=\"lr-display\">0.1</span></span>\r\n        <input id=\"learning-rate-input\" type=\"range\" step=\"0.01\" min=\"0.01\" max=\"1\" value=\"0.1\"\r\n          class=\"mt-1 block w-full cursor-pointer\" oninput=\"document.getElementById(\'lr-display\').innerText = this.value\" />\r\n      </label>\r\n      <div id=\"weights-display\" class=\"pt-2\"></div>\r\n    </div>\r\n    ";
    settingsBox.innerHTML = html;
    wrapper.appendChild(buttonsBox);
    wrapper.appendChild(settingsBox);
    return wrapper;
}

