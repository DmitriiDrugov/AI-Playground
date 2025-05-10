
export function render(onClick) {
    const canvas = document.createElement("canvas");
    canvas.className = "border border-blue-300 bg-white";
    canvas.id = "perceptron-canvas";
    canvas.width = 700;
    canvas.height = 500;
    canvas.addEventListener("click", (ev) => {
        const ev_1 = ev;
        const rect = canvas.getBoundingClientRect();
        const x = ev_1.clientX - rect.left;
        const y = ev_1.clientY - rect.top;
        const width = canvas.width;
        const height = canvas.height;
        const xNorm = ((x / width) * 2) - 1;
        const yNorm = -(((y / height) * 2) - 1);
        onClick([xNorm, yNorm, 0]);
    });
    canvas.addEventListener("contextmenu", (ev_2) => {
        ev_2.preventDefault();
        const ev_3 = ev_2;
        const rect_1 = canvas.getBoundingClientRect();
        const x_1 = ev_3.clientX - rect_1.left;
        const y_1 = ev_3.clientY - rect_1.top;
        const width_1 = canvas.width;
        const height_1 = canvas.height;
        const xNorm_1 = ((x_1 / width_1) * 2) - 1;
        const yNorm_1 = -(((y_1 / height_1) * 2) - 1);
        onClick([xNorm_1, yNorm_1, 1]);
    });
    return canvas;
}

