
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
        onClick([((x / canvas.width) * 2) - 1, -(((y / canvas.height) * 2) - 1), 0]);
    });
    canvas.addEventListener("contextmenu", (ev_2) => {
        ev_2.preventDefault();
        const ev_3 = ev_2;
        const rect_1 = canvas.getBoundingClientRect();
        const x_1 = ev_3.clientX - rect_1.left;
        const y_1 = ev_3.clientY - rect_1.top;
        onClick([((x_1 / canvas.width) * 2) - 1, -(((y_1 / canvas.height) * 2) - 1), 1]);
    });
    return canvas;
}

