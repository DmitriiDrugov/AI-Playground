import { Record } from "../fable_modules/fable-library-js.4.25.0/Types.js";
import { array_type, bool_type, record_type, int32_type, float64_type } from "../fable_modules/fable-library-js.4.25.0/Reflection.js";
import { equalArrays, comparePrimitives, disposeSafe, getEnumerator, defaultOf, equals, createAtom } from "../fable_modules/fable-library-js.4.25.0/Util.js";
import { cons, singleton, item as item_1, length, empty } from "../fable_modules/fable-library-js.4.25.0/List.js";
import { parse } from "../fable_modules/fable-library-js.4.25.0/Double.js";
import { some } from "../fable_modules/fable-library-js.4.25.0/Option.js";
import { fill, mapIndexed, sortBy, initialize, item } from "../fable_modules/fable-library-js.4.25.0/Array.js";
import { printf, toText } from "../fable_modules/fable-library-js.4.25.0/String.js";
import { rangeDouble } from "../fable_modules/fable-library-js.4.25.0/Range.js";
import { nonSeeded } from "../fable_modules/fable-library-js.4.25.0/Random.js";
import { Queue$1__Dequeue, Queue$1__get_Count, Queue$1__Enqueue_2B595, Queue$1_$ctor } from "../fable_modules/fable-library-js.4.25.0/System.Collections.Generic.js";
import { render } from "./Components/Canvas.fs.js";
import { render as render_1 } from "./Components/Header.fs.js";
import { render as render_2 } from "./Components/Visualizer.fs.js";
import { render as render_3 } from "./Components/ControlPanel.fs.js";

export class Point extends Record {
    constructor(X, Y, Class) {
        super();
        this.X = X;
        this.Y = Y;
        this.Class = (Class | 0);
    }
}

export function Point_$reflection() {
    return record_type("Program.Point", [], Point, () => [["X", float64_type], ["Y", float64_type], ["Class", int32_type]]);
}

export let points = createAtom(empty());

export let weights = createAtom(new Float64Array([0.5, 0.5]));

export let bias = createAtom(0);

export let learningRate = createAtom(0.1);

export let isMazeMode = createAtom(false);

export let isSolving = createAtom(false);

export let maze = createAtom([new Int32Array([0])]);

export let startPos = createAtom([0, 0]);

export let goalPos = createAtom([0, 0]);

export function setupLearningRateInput() {
    const el = document.getElementById("learning-rate-input");
    if (!(el == null)) {
        const input = el;
        input.addEventListener("input", (_arg) => {
            const parsed = parse(input.value);
            if (!Number.isNaN(parsed)) {
                learningRate(parsed);
            }
        });
    }
    else {
        console.warn(some("⚠️ learning-rate-input не найден"));
    }
}

export function updateWeightsDisplay() {
    let arg, arg_1, arg_2;
    const el = document.getElementById("weights-display");
    if (!equals(el, defaultOf())) {
        el.innerHTML = ((arg = item(0, weights()), (arg_1 = item(1, weights()), (arg_2 = bias(), toText(printf("\r\n            <div><strong>w0:</strong> %.4f</div>\r\n            <div><strong>w1:</strong> %.4f</div>\r\n            <div><strong>bias:</strong> %.4f</div>\r\n            "))(arg)(arg_1)(arg_2)))));
    }
}

export function computeConfusionMatrix() {
    let tp = 0;
    let tn = 0;
    let fp = 0;
    let fn = 0;
    const enumerator = getEnumerator(points());
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const p = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const input = new Float64Array([p.X, p.Y]);
            const sum = ((item(0, input) * item(0, weights())) + (item(1, input) * item(1, weights()))) + bias();
            const predicted = ((sum >= 0) ? 1 : 0) | 0;
            const matchValue_4 = p.Class | 0;
            let matchResult;
            switch (matchValue_4) {
                case 0: {
                    switch (predicted) {
                        case 0: {
                            matchResult = 1;
                            break;
                        }
                        case 1: {
                            matchResult = 2;
                            break;
                        }
                        default:
                            matchResult = 4;
                    }
                    break;
                }
                case 1: {
                    switch (predicted) {
                        case 0: {
                            matchResult = 3;
                            break;
                        }
                        case 1: {
                            matchResult = 0;
                            break;
                        }
                        default:
                            matchResult = 4;
                    }
                    break;
                }
                default:
                    matchResult = 4;
            }
            switch (matchResult) {
                case 0: {
                    tp = ((tp + 1) | 0);
                    break;
                }
                case 1: {
                    tn = ((tn + 1) | 0);
                    break;
                }
                case 2: {
                    fp = ((fp + 1) | 0);
                    break;
                }
                case 3: {
                    fn = ((fn + 1) | 0);
                    break;
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return [tp, fp, fn, tn];
}

export function updateConfusionMatrix() {
    const container = document.getElementById("metrics-container");
    if (!equals(container, defaultOf())) {
        const patternInput = computeConfusionMatrix();
        const tp = patternInput[0] | 0;
        const tn = patternInput[3] | 0;
        const fp = patternInput[1] | 0;
        const fn = patternInput[2] | 0;
        const matrixHtml = `
            <h2 class="font-semibold mb-2">Confusion Matrix</h2>
            <table class="table-auto text-sm text-center w-full border">
                <thead>
                    <tr>
                        <th></th>
                        <th>Pred 0</th>
                        <th>Pred 1</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Actual 0</th>
                        <td class="border">TN<br><strong>${tn}</strong></td>
                        <td class="border">FP<br><strong>${fp}</strong></td>
                    </tr>
                    <tr>
                        <th>Actual 1</th>
                        <td class="border">FN<br><strong>${fn}</strong></td>
                        <td class="border">TP<br><strong>${tp}</strong></td>
                    </tr>
                </tbody>
            </table>
            `;
        const matrixDiv = container.querySelector("#confusion-table");
        if (matrixDiv == null) {
            const newDiv = document.createElement("div");
            newDiv.id = "confusion-table";
            newDiv.innerHTML = matrixHtml;
            container.innerHTML = "";
            container.appendChild(newDiv);
            const logDiv = document.createElement("div");
            logDiv.id = "training-log";
            logDiv.className = "text-xs whitespace-pre-wrap font-mono bg-white p-2 border rounded mt-4 max-h-48 overflow-y-auto";
            container.appendChild(logDiv);
        }
        else {
            matrixDiv.innerHTML = matrixHtml;
        }
    }
}

export function appendLog(text) {
    const logEl = document.getElementById("training-log");
    if (!equals(logEl, defaultOf())) {
        logEl.innerHTML = ((logEl.innerHTML + text) + "<br>");
    }
}

export function drawDecisionBoundary() {
    const canvas = document.getElementById("perceptron-canvas");
    const ctx = canvas.getContext('2d');
    const matchValue = item(0, weights());
    const w1 = item(1, weights());
    const w0 = matchValue;
    if (w1 !== 0) {
        const yFromX = (x) => ((-(w0 / w1) * x) - (bias() / w1));
        const toCanvas = (tupledArg) => {
            const x_1 = tupledArg[0];
            const y = tupledArg[1];
            const px = ((x_1 + 1) / 2) * canvas.width;
            const py = (1 - ((y + 1) / 2)) * canvas.height;
            return [px, py];
        };
        const patternInput_1 = toCanvas([-1, yFromX(-1)]);
        const py1 = patternInput_1[1];
        const px1 = patternInput_1[0];
        const patternInput_2 = toCanvas([1, yFromX(1)]);
        const py2 = patternInput_2[1];
        const px2 = patternInput_2[0];
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

export function drawPoints() {
    let arg_1, matchValue_3;
    const canvas = document.getElementById("perceptron-canvas");
    const ctx = canvas.getContext('2d');
    const w = ~~canvas.width | 0;
    const h = ~~canvas.height | 0;
    const gridSize = 4;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const enumerator = getEnumerator(rangeDouble(0, gridSize, w - 1));
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const i = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]() | 0;
            const enumerator_1 = getEnumerator(rangeDouble(0, gridSize, h - 1));
            try {
                while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
                    const j = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]() | 0;
                    const x = ((i / w) * 2) - 1;
                    const y = -(((j / h) * 2) - 1);
                    const sum = ((x * item(0, weights())) + (y * item(1, weights()))) + bias();
                    const prob = 1 / (1 + Math.exp(-sum));
                    ctx.fillStyle = ((prob >= 0.5) ? toText(printf("rgba(220,38,38,%.2f)"))(prob) : ((arg_1 = (1 - prob), toText(printf("rgba(37,99,235,%.2f)"))(arg_1))));
                    ctx.fillRect(i, j, gridSize, gridSize);
                }
            }
            finally {
                disposeSafe(enumerator_1);
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    const enumerator_2 = getEnumerator(points());
    try {
        while (enumerator_2["System.Collections.IEnumerator.MoveNext"]()) {
            const p = enumerator_2["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const px = ((p.X + 1) / 2) * canvas.width;
            const py = (1 - ((p.Y + 1) / 2)) * canvas.height;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, 2 * 3.141592653589793);
            ctx.fillStyle = ((matchValue_3 = (p.Class | 0), (matchValue_3 === 0) ? "#2563eb" : ((matchValue_3 === 1) ? "#dc2626" : "#000000")));
            ctx.fill();
        }
    }
    finally {
        disposeSafe(enumerator_2);
    }
    drawDecisionBoundary();
}

export class Cell extends Record {
    constructor(visited, walls) {
        super();
        this.visited = visited;
        this.walls = walls;
    }
}

export function Cell_$reflection() {
    return record_type("Program.Cell", [], Cell, () => [["visited", bool_type], ["walls", array_type(bool_type)]]);
}

export function generateMazeWithLongestPath(rows, cols) {
    const rand = nonSeeded();
    const grid = initialize(rows, (_arg) => initialize(cols, (_arg_1) => (new Cell(false, [true, true, true, true]))));
    const directions = [[0, -1], [-1, 0], [0, 1], [1, 0]];
    const wallPairs = [[3, 1], [0, 2], [1, 3], [2, 0]];
    const shuffledDirections = () => sortBy((_arg_2) => rand.Next0(), directions, {
        Compare: comparePrimitives,
    });
    const dfs = (r, c) => {
        item(c, item(r, grid)).visited = true;
        const arr = mapIndexed((i, tupledArg) => {
            const dr = tupledArg[0] | 0;
            const dc = tupledArg[1] | 0;
            return [i, dr, dc];
        }, shuffledDirections());
        for (let idx = 0; idx <= (arr.length - 1); idx++) {
            const forLoopVar = item(idx, arr);
            const i_1 = forLoopVar[0] | 0;
            const dr_1 = forLoopVar[1] | 0;
            const dc_1 = forLoopVar[2] | 0;
            const nr = (r + dr_1) | 0;
            const nc = (c + dc_1) | 0;
            if (((((nr >= 0) && (nc >= 0)) && (nr < rows)) && (nc < cols)) && !item(nc, item(nr, grid)).visited) {
                const oppositeWall = item(i_1, wallPairs);
                item(c, item(r, grid)).walls[i_1] = false;
                item(nc, item(nr, grid)).walls[oppositeWall[1]] = false;
                dfs(nr, nc);
            }
        }
    };
    dfs(0, 0);
    const distances = initialize(rows, (_arg_3) => fill(new Int32Array(cols), 0, cols, -1));
    const q = Queue$1_$ctor();
    Queue$1__Enqueue_2B595(q, [0, 0]);
    item(0, distances)[0] = 0;
    let farthest = [0, 0];
    while (Queue$1__get_Count(q) > 0) {
        const patternInput_1 = Queue$1__Dequeue(q);
        const r_1 = patternInput_1[0] | 0;
        const c_1 = patternInput_1[1] | 0;
        for (let i_2 = 0; i_2 <= 3; i_2++) {
            const patternInput_2 = item(i_2, directions);
            const dr_2 = patternInput_2[0] | 0;
            const dc_2 = patternInput_2[1] | 0;
            const nr_1 = (r_1 + dr_2) | 0;
            const nc_1 = (c_1 + dc_2) | 0;
            if ((((((nr_1 >= 0) && (nc_1 >= 0)) && (nr_1 < rows)) && (nc_1 < cols)) && !item(i_2, item(c_1, item(r_1, grid)).walls)) && (item(nc_1, item(nr_1, distances)) === -1)) {
                item(nr_1, distances)[nc_1] = ((item(c_1, item(r_1, distances)) + 1) | 0);
                Queue$1__Enqueue_2B595(q, [nr_1, nc_1]);
                if (item(nc_1, item(nr_1, distances)) > item(farthest[1], item(farthest[0], distances))) {
                    farthest = [nr_1, nc_1];
                }
            }
        }
    }
    const mazeSize = ((rows * 2) + 1) | 0;
    const maze_1 = initialize(mazeSize, (_arg_4) => fill(new Int32Array(mazeSize), 0, mazeSize, 1));
    for (let r_2 = 0; r_2 <= (rows - 1); r_2++) {
        for (let c_2 = 0; c_2 <= (cols - 1); c_2++) {
            const cell = item(c_2, item(r_2, grid));
            const mr = ((r_2 * 2) + 1) | 0;
            const mc = ((c_2 * 2) + 1) | 0;
            item(mr, maze_1)[mc] = 0;
            if (!item(0, cell.walls)) {
                item(mr - 1, maze_1)[mc] = 0;
            }
            if (!item(1, cell.walls)) {
                item(mr, maze_1)[mc + 1] = 0;
            }
            if (!item(2, cell.walls)) {
                item(mr + 1, maze_1)[mc] = 0;
            }
            if (!item(3, cell.walls)) {
                item(mr, maze_1)[mc - 1] = 0;
            }
        }
    }
    const entrance = [mazeSize - 2, 1];
    const rExit = farthest[0] | 0;
    const cExit = farthest[1] | 0;
    const exit = [(rExit * 2) + 1, (cExit * 2) + 1];
    item(entrance[0], maze_1)[entrance[1]] = 0;
    item(exit[0], maze_1)[exit[1]] = 0;
    return [maze_1, entrance, exit];
}

export const patternInput$0040281 = generateMazeWithLongestPath(20, 35);

export const start = patternInput$0040281[1];

export const m = patternInput$0040281[0];

export const goal = patternInput$0040281[2];

maze(m);

startPos(start);

goalPos(goal);

export function drawMaze() {
    const canvas = document.getElementById("maze-canvas");
    const ctx = canvas.getContext('2d');
    const rows = maze().length | 0;
    const cols = item(0, maze()).length | 0;
    const cellSize = canvas.width / cols;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row <= (rows - 1); row++) {
        for (let col = 0; col <= (cols - 1); col++) {
            const x = col * cellSize;
            const y = row * cellSize;
            if (item(col, item(row, maze())) === 1) {
                ctx.fillStyle = "#000000";
            }
            else {
                ctx.fillStyle = "#ffffff";
            }
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = "#cccccc";
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }
    ctx.fillStyle = "limegreen";
    ctx.beginPath();
    ctx.arc(cellSize / 2, cellSize / 2, cellSize / 3, 0, 2 * 3.141592653589793);
    ctx.fill();
}

export function animatePath(canvas, path) {
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / item(0, maze()).length;
    const loop = (index) => {
        if (index < length(path)) {
            const patternInput = item_1(index, path);
            const r = patternInput[0] | 0;
            const c = patternInput[1] | 0;
            const x = (c * cellSize) + (cellSize / 2);
            const y = (r * cellSize) + (cellSize / 2);
            ctx.fillStyle = "limegreen";
            ctx.beginPath();
            ctx.arc(x, y, cellSize / 4, 0, 2 * 3.141592653589793);
            ctx.fill();
            window.setTimeout(() => {
                loop(index + 1);
            }, 100);
        }
    };
    loop(0);
}

export function solveMaze() {
    if (isSolving()) {
        console.warn(some("Maze is currently being solved."));
    }
    else {
        isSolving(true);
        const canvas = document.getElementById("maze-canvas");
        const ctx = canvas.getContext('2d');
        const rows = maze().length | 0;
        const cols = item(0, maze()).length | 0;
        const start_1 = startPos();
        const goal_1 = goalPos();
        const visited = initialize(rows, (_arg) => fill(new Array(cols), 0, cols, false));
        const parent = initialize(rows, (_arg_1) => fill(new Array(cols), 0, cols, undefined));
        const q = Queue$1_$ctor();
        Queue$1__Enqueue_2B595(q, start_1);
        item(start_1[0], visited)[start_1[1]] = true;
        const directions = [[0, -1], [-1, 0], [0, 1], [1, 0]];
        const rand = nonSeeded();
        const shuffledDirections = () => sortBy((_arg_2) => rand.Next0(), directions, {
            Compare: comparePrimitives,
        });
        let found = false;
        while ((Queue$1__get_Count(q) > 0) && !found) {
            const patternInput_1 = Queue$1__Dequeue(q);
            const r = patternInput_1[0] | 0;
            const c = patternInput_1[1] | 0;
            const arr = shuffledDirections();
            for (let idx = 0; idx <= (arr.length - 1); idx++) {
                const forLoopVar = item(idx, arr);
                const dr = forLoopVar[0] | 0;
                const dc = forLoopVar[1] | 0;
                const nr = (r + dr) | 0;
                const nc = (c + dc) | 0;
                if ((((((nr >= 0) && (nc >= 0)) && (nr < rows)) && (nc < cols)) && (item(nc, item(nr, maze())) === 0)) && !item(nc, item(nr, visited))) {
                    item(nr, visited)[nc] = true;
                    item(nr, parent)[nc] = [r, c];
                    Queue$1__Enqueue_2B595(q, [nr, nc]);
                    if (equalArrays([nr, nc], goal_1)) {
                        found = true;
                    }
                }
            }
        }
        if (found) {
            let path = singleton(goal_1);
            let curr = goal_1;
            while (!equalArrays(curr, start_1)) {
                const matchValue_4 = item(curr[1], item(curr[0], parent));
                if (matchValue_4 == null) {
                    throw new Error("No path");
                }
                else {
                    const p = matchValue_4;
                    path = cons(p, path);
                    curr = p;
                }
            }
            animatePath(canvas, path);
            window.setTimeout(() => {
                isSolving(false);
            }, (length(path) * 100) + 200);
        }
        else {
            console.warn(some("No path found"));
            isSolving(false);
        }
    }
}

export function handleCanvasClick(x, y, cls) {
    points(cons(new Point(x, y, cls), points()));
    drawPoints();
    updateWeightsDisplay();
    updateConfusionMatrix();
}

export function trainUntilPerfect(epoch) {
    let arg_1, arg_2, arg_3;
    let hasError = false;
    const enumerator = getEnumerator(points());
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const p = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const input = new Float64Array([p.X, p.Y]);
            const target = p.Class;
            const sum = ((item(0, input) * item(0, weights())) + (item(1, input) * item(1, weights()))) + bias();
            const output = (sum >= 0) ? 1 : 0;
            const error = target - output;
            if (error !== 0) {
                hasError = true;
                const lr = learningRate();
                weights()[0] = (item(0, weights()) + ((lr * error) * item(0, input)));
                weights()[1] = (item(1, weights()) + ((lr * error) * item(1, input)));
                bias(bias() + (lr * error));
                appendLog((arg_1 = ((lr * error) * item(0, input)), (arg_2 = ((lr * error) * item(1, input)), (arg_3 = (lr * error), toText(printf("Epoch %d: Δw0 = %.4f, Δw1 = %.4f, Δb = %.4f"))(epoch)(arg_1)(arg_2)(arg_3)))));
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    drawPoints();
    updateWeightsDisplay();
    updateConfusionMatrix();
    if (hasError && (epoch < 200)) {
        window.requestAnimationFrame((_arg) => {
            trainUntilPerfect(epoch + 1);
        });
    }
    else {
        const msg = hasError ? "Training stopped after 200 epochs with some errors." : "Training completed successfully without errors!";
        window.alert(some(msg));
    }
}

export function startTraining() {
    if (isMazeMode()) {
        solveMaze();
    }
    else {
        const log = document.getElementById("training-log");
        if (!equals(log, defaultOf())) {
            log.innerHTML = "";
        }
        trainUntilPerfect(0);
    }
}

export function randomizeWeights() {
    const rand = () => ((Math.random() * 2) - 1);
    weights(new Float64Array([rand(), rand()]));
    bias(rand());
    drawPoints();
    updateWeightsDisplay();
    updateConfusionMatrix();
}

export function resetPoints() {
    if (isMazeMode()) {
        const patternInput = generateMazeWithLongestPath(20, 35);
        const start_1 = patternInput[1];
        const m_1 = patternInput[0];
        const goal_1 = patternInput[2];
        maze(m_1);
        startPos(start_1);
        goalPos(goal_1);
        drawMaze();
    }
    else {
        points(empty());
        drawPoints();
        updateWeightsDisplay();
        updateConfusionMatrix();
    }
}

export function onBtn(id, action) {
    const el = document.getElementById(id);
    if (el == null) {
        console.warn(some(toText(printf("Element with id \'%s\' not found"))(id)));
    }
    else {
        el.addEventListener("click", (_arg) => {
            action();
        });
    }
}

export function showHelpModal() {
    const existing = document.getElementById("help-modal");
    if (!equals(existing, defaultOf())) {
        if (existing.classList.contains("hidden")) {
            existing.classList.remove("hidden");
        }
        else {
            existing.classList.add("hidden");
        }
    }
    else {
        const helpBtn = document.getElementById("btn-help");
        const rect = helpBtn.getBoundingClientRect();
        const modal = document.createElement("div");
        modal.id = "help-modal";
        modal.className = "absolute bg-white rounded p-6 shadow-lg border w-[32rem] z-50 text-sm leading-relaxed";
        modal.setAttribute("style", `top:${rect.bottom + 10}px;left:${rect.left - 320}px;`);
        modal.innerHTML = "\r\n            <h2 class=\"text-xl font-semibold mb-3\">About this Project</h2>\r\n<p>This interactive project demonstrates two classic AI approaches in action:</p>\r\n\r\n<h3 class=\"font-semibold mt-4\">🧠 Perceptron Mode</h3>\r\n<p>A perceptron is a basic neural unit that learns to separate 2D points into two classes using linear boundaries.</p>\r\n<ul class=\"list-disc list-inside mt-1\">\r\n  <li>Click on canvas to add blue (Class 0) or red (Class 1) points</li>\r\n  <li>Train the perceptron to learn the boundary</li>\r\n  <li>The decision boundary is shown as a black line</li>\r\n  <li>The background color indicates prediction confidence</li>\r\n</ul>\r\n\r\n<h3 class=\"font-semibold mt-4\">🧩 Maze Mode</h3>\r\n<p>In this mode, an agent uses Breadth-First Search (BFS) to solve a procedurally generated maze.</p>\r\n<ul class=\"list-disc list-inside mt-1\">\r\n  <li>Click <b>Train</b> to start pathfinding</li>\r\n  <li>The green dot animates as it finds the path</li>\r\n  <li>All mazes are guaranteed to have one valid solution</li>\r\n</ul>\r\n\r\n<h3 class=\"font-semibold mt-4\">🛠️ Tech Stack</h3>\r\n<ul class=\"list-disc list-inside mt-1\">\r\n  <li>F# + Fable (compiled to JavaScript)</li>\r\n  <li>HTML Canvas</li>\r\n  <li>Tailwind CSS</li>\r\n</ul>\r\n\r\n<p class=\"mt-4\">Made by Dmitrii Drugov – HFAA90</p>\r\n<button id=\"close-help\" class=\"mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700\">Close</button>\r\n\r\n            ";
        document.body.appendChild(modal);
        const closeBtn = modal.querySelector("#close-help");
        closeBtn.addEventListener("click", (_arg) => {
            modal.classList.add("hidden");
        });
    }
}

export const canvasElement = render((tupledArg) => {
    handleCanvasClick(tupledArg[0], tupledArg[1], tupledArg[2]);
});

export const mazeCanvas = document.createElement("canvas");

mazeCanvas.id = "maze-canvas";

(function () {
    const value = mazeCanvas.setAttribute("width", "600");
})();

(function () {
    const value = mazeCanvas.setAttribute("height", "400");
})();

mazeCanvas.className = "hidden border rounded bg-white";

export const header = render_1();

export const visualizer = render_2();

export const controls = render_3();

export const app = document.createElement("div");

app.className = "min-h-screen bg-gray-100 flex flex-col items-center gap-4 pt-10 max-w-screen-xl w-full mx-auto overflow-x-hidden";

visualizer.appendChild(canvasElement);

visualizer.appendChild(mazeCanvas);

app.appendChild(header);

export const modeSwitcher = document.createElement("button");

modeSwitcher.textContent = "Switch to Maze Mode";

modeSwitcher.className = "bg-gray-200 px-4 py-2 rounded border shadow hover:bg-gray-300";

modeSwitcher.id = "btn-switch-mode";

modeSwitcher.addEventListener("click", (_arg) => {
    isMazeMode(!isMazeMode());
    const perceptronCanvas = document.getElementById("perceptron-canvas");
    const mazeCanvas_1 = document.getElementById("maze-canvas");
    if (isMazeMode()) {
        modeSwitcher.textContent = "Switch to Perceptron Mode";
        perceptronCanvas.classList.add("hidden");
        mazeCanvas_1.classList.remove("hidden");
        drawMaze();
    }
    else {
        modeSwitcher.textContent = "Switch to Maze Mode";
        mazeCanvas_1.classList.add("hidden");
        perceptronCanvas.classList.remove("hidden");
    }
});

app.appendChild(modeSwitcher);

app.appendChild(visualizer);

app.appendChild(controls);

document.getElementById("root").appendChild(app);

onBtn("btn-train", () => {
    startTraining();
});

onBtn("btn-reset", () => {
    resetPoints();
});

onBtn("btn-random", () => {
    randomizeWeights();
});

onBtn("btn-help", () => {
    showHelpModal();
});

setupLearningRateInput();

updateWeightsDisplay();

updateConfusionMatrix();

