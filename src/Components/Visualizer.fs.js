
export function render() {
    const container = document.createElement("div");
    container.className = "flex flex-col md:flex-row gap-6 items-start justify-center w-full max-w-6xl";
    const metricsWrapper = document.createElement("div");
    metricsWrapper.className = "bg-white border shadow rounded p-4 w-64 text-sm";
    metricsWrapper.id = "metrics-container";
    metricsWrapper.innerHTML = "\r\n        <h2 class=\"font-semibold mb-2\">Confusion Matrix</h2>\r\n        <table class=\"table-auto text-sm text-center w-full border\">\r\n            <thead>\r\n                <tr>\r\n                    <th></th>\r\n                    <th>Pred 0</th>\r\n                    <th>Pred 1</th>\r\n                </tr>\r\n            </thead>\r\n            <tbody>\r\n                <tr>\r\n                    <th>Actual 0</th>\r\n                    <td class=\"border\">TN<br><strong>0</strong></td>\r\n                    <td class=\"border\">FP<br><strong>0</strong></td>\r\n                </tr>\r\n                <tr>\r\n                    <th>Actual 1</th>\r\n                    <td class=\"border\">FN<br><strong>0</strong></td>\r\n                    <td class=\"border\">TP<br><strong>0</strong></td>\r\n                </tr>\r\n            </tbody>\r\n        </table>\r\n        <div id=\"training-log\" class=\"text-xs whitespace-pre-wrap font-mono bg-white p-2 border rounded mt-4 max-h-48 overflow-y-auto\"></div>\r\n    ";
    container.appendChild(metricsWrapper);
    return container;
}

