
export function render() {
    const overlay = document.createElement("div");
    overlay.id = "modal-overlay";
    overlay.className = "fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50 hidden";
    const modal = document.createElement("div");
    modal.className = "bg-white rounded p-6 shadow-lg max-w-md text-sm text-gray-800";
    const title = document.createElement("h2");
    title.className = "text-lg font-bold mb-2";
    title.textContent = "About Neural Net Visualizer";
    const body = document.createElement("p");
    body.textContent = "This project demonstrates how a simple perceptron learns to classify points into two categories. You can add red and blue points, then train the model to adjust weights and draw a decision boundary.";
    const close = document.createElement("button");
    close.className = "mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600";
    close.textContent = "Close";
    close.addEventListener("click", (_arg) => {
        overlay.classList.add("hidden");
    });
    modal.appendChild(title);
    modal.appendChild(body);
    modal.appendChild(close);
    overlay.appendChild(modal);
    return overlay;
}

