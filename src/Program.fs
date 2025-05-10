open Browser.Dom
open Browser.Types
open Fable.Core
open Fable.Core.JsInterop
open Components.Header
open Components.Visualizer
open Components.ControlPanel
open Components.Canvas
open Components

type Point = { X: float; Y: float; Class: int }

let mutable points: Point list = []
let mutable weights = [| 0.5; 0.5 |]
let mutable bias = 0.0
let mutable learningRate = 0.1
let mutable isMazeMode = false

let mutable isSolving = false
let mutable maze: int[][] = [| [| 0 |] |]
let mutable startPos = (0, 0)
let mutable goalPos = (0, 0)




let setupLearningRateInput () =
    let el = document.getElementById "learning-rate-input"

    if not (isNull el) then
        let input = el :?> HTMLInputElement

        input.addEventListener (
            "input",
            fun _ ->
                let parsed = float input.value

                if not (System.Double.IsNaN(parsed)) then
                    learningRate <- parsed
        )
    else
        console.warn "⚠️ learning-rate-input не найден"


let updateWeightsDisplay () =
    let el = document.getElementById "weights-display"

    if el <> null then
        el.innerHTML <-
            sprintf
                """
            <div><strong>w0:</strong> %.4f</div>
            <div><strong>w1:</strong> %.4f</div>
            <div><strong>bias:</strong> %.4f</div>
            """
                weights.[0]
                weights.[1]
                bias

let computeConfusionMatrix () =
    let mutable tp, tn, fp, fn = 0, 0, 0, 0

    for p in points do
        let input = [| p.X; p.Y |]
        let sum = input.[0] * weights.[0] + input.[1] * weights.[1] + bias
        let predicted = if sum >= 0.0 then 1 else 0

        match p.Class, predicted with
        | 1, 1 -> tp <- tp + 1
        | 0, 0 -> tn <- tn + 1
        | 0, 1 -> fp <- fp + 1
        | 1, 0 -> fn <- fn + 1
        | _ -> ()

    (tp, fp, fn, tn)

let updateConfusionMatrix () =
    let container = document.getElementById "metrics-container"

    if container <> null then
        let (tp, fp, fn, tn) = computeConfusionMatrix ()

        let matrixHtml =
            $"""
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
                        <td class="border">TN<br><strong>{tn}</strong></td>
                        <td class="border">FP<br><strong>{fp}</strong></td>
                    </tr>
                    <tr>
                        <th>Actual 1</th>
                        <td class="border">FN<br><strong>{fn}</strong></td>
                        <td class="border">TP<br><strong>{tp}</strong></td>
                    </tr>
                </tbody>
            </table>
            """

        let matrixDiv = container.querySelector "#confusion-table"

        if isNull matrixDiv then
            let newDiv = document.createElement "div"
            newDiv.id <- "confusion-table"
            newDiv.innerHTML <- matrixHtml
            container.innerHTML <- "" // первый раз
            container.appendChild newDiv |> ignore

            let logDiv = document.createElement "div"
            logDiv.id <- "training-log"

            logDiv.className <-
                "text-xs whitespace-pre-wrap font-mono bg-white p-2 border rounded mt-4 max-h-48 overflow-y-auto"

            container.appendChild logDiv |> ignore
        else
            matrixDiv.innerHTML <- matrixHtml

let appendLog (text: string) =
    let logEl = document.getElementById "training-log"

    if logEl <> null then
        logEl.innerHTML <- logEl.innerHTML + text + "<br>"

let drawDecisionBoundary () =
    let canvas = document.getElementById "perceptron-canvas" :?> HTMLCanvasElement
    let ctx = canvas.getContext_2d ()
    let w0, w1 = weights.[0], weights.[1]

    if w1 <> 0.0 then
        let yFromX x = -(w0 / w1) * x - (bias / w1)

        let toCanvas (x, y) =
            let px = (x + 1.0) / 2.0 * float canvas.width
            let py = (1.0 - (y + 1.0) / 2.0) * float canvas.height
            (px, py)

        let (px1, py1) = toCanvas (-1.0, yFromX -1.0)
        let (px2, py2) = toCanvas (1.0, yFromX 1.0)
        ctx.beginPath ()
        ctx.moveTo (px1, py1)
        ctx.lineTo (px2, py2)
        ctx.strokeStyle <- !!"black"
        ctx.lineWidth <- 2.0
        ctx.stroke ()

let drawPoints () =
    let canvas = document.getElementById "perceptron-canvas" :?> HTMLCanvasElement
    let ctx = canvas.getContext_2d ()
    let w, h, gridSize = int canvas.width, int canvas.height, 4
    ctx.clearRect (0.0, 0.0, canvas.width, canvas.height)

    for i in 0..gridSize .. w - 1 do
        for j in 0..gridSize .. h - 1 do
            let x = (float i / float w) * 2.0 - 1.0
            let y = -((float j / float h) * 2.0 - 1.0)
            let sum = x * weights.[0] + y * weights.[1] + bias
            let prob = 1.0 / (1.0 + exp (-sum))

            ctx.fillStyle <-
                if prob >= 0.5 then
                    !!(sprintf "rgba(220,38,38,%.2f)" prob)
                else
                    !!(sprintf "rgba(37,99,235,%.2f)" (1.0 - prob))

            ctx.fillRect (float i, float j, float gridSize, float gridSize)

    for p in points do
        let px = (p.X + 1.0) / 2.0 * float canvas.width
        let py = (1.0 - (p.Y + 1.0) / 2.0) * float canvas.height
        ctx.beginPath ()
        ctx.arc (px, py, 5.0, 0.0, 2.0 * System.Math.PI)

        ctx.fillStyle <-
            match p.Class with
            | 0 -> !!"#2563eb"
            | 1 -> !!"#dc2626"
            | _ -> !!"#000000"

        ctx.fill ()

    drawDecisionBoundary ()

type Cell =
    { mutable visited: bool
      mutable walls: bool[] } // top, right, bottom, left

let generateMazeWithLongestPath rows cols : int[][] * (int * int) * (int * int) =
    let rand = System.Random()

    let grid =
        Array.init rows (fun _ ->
            Array.init cols (fun _ ->
                { visited = false
                  walls = [| true; true; true; true |] }))

    let directions = [| (0, -1); (-1, 0); (0, 1); (1, 0) |]
    let wallPairs = [| (3, 1); (0, 2); (1, 3); (2, 0) |]

    let shuffledDirections () =
        directions |> Array.sortBy (fun _ -> rand.Next())

    let rec dfs r c =
        grid.[r].[c].visited <- true

        for (i, dr, dc) in shuffledDirections () |> Array.mapi (fun i (dr, dc) -> (i, dr, dc)) do
            let nr, nc = r + dr, c + dc

            if nr >= 0 && nc >= 0 && nr < rows && nc < cols && not grid.[nr].[nc].visited then
                let oppositeWall = wallPairs.[i]
                grid.[r].[c].walls.[i] <- false
                grid.[nr].[nc].walls.[snd oppositeWall] <- false
                dfs nr nc

    dfs 0 0

    // Изменяем создание лабиринта с учетом разницы между строками и столбцами:
    let mazeRows = rows * 2 + 1
    let mazeCols = cols * 2 + 1
    let maze = Array.init mazeRows (fun _ -> Array.create mazeCols 1)

    for r in 0 .. rows - 1 do
        for c in 0 .. cols - 1 do
            let cell = grid.[r].[c]
            let mr, mc = r * 2 + 1, c * 2 + 1
            maze.[mr].[mc] <- 0

            if not cell.walls.[0] then
                maze.[mr - 1].[mc] <- 0

            if not cell.walls.[1] then
                maze.[mr].[mc + 1] <- 0

            if not cell.walls.[2] then
                maze.[mr + 1].[mc] <- 0

            if not cell.walls.[3] then
                maze.[mr].[mc - 1] <- 0

    // Вход всегда фиксирован внутри лабиринта
    let entrance = (1, 1)
    maze.[fst entrance].[snd entrance] <- 0

    // Выбираем выход – исключительно из внутренних проходимых ячеек
    let passableCells =
        [ for r in 2 .. mazeRows - 3 do
              for c in 2 .. mazeCols - 3 do
                  if maze.[r].[c] = 0 && (r, c) <> entrance then
                      yield (r, c) ]

    let exit =
        if passableCells.Length > 0 then
            passableCells.[rand.Next passableCells.Length]
        else
            entrance

    maze.[fst exit].[snd exit] <- 0
    (maze, entrance, exit)





let rec generateSolvableMaze rows cols =
    let (m, start, goal) = generateMazeWithLongestPath rows cols

    let isSolvable =
        let visited = Array.init m.Length (fun _ -> Array.create m.[0].Length false)
        let q = System.Collections.Generic.Queue()
        q.Enqueue(start)
        visited.[fst start].[snd start] <- true

        let directions = [| (0, -1); (-1, 0); (0, 1); (1, 0) |]

        let mutable found = false

        while q.Count > 0 && not found do
            let (r, c) = q.Dequeue()

            for (dr, dc) in directions do
                let nr, nc = r + dr, c + dc

                if
                    nr >= 0
                    && nc >= 0
                    && nr < m.Length
                    && nc < m.[0].Length
                    && m.[nr].[nc] = 0
                    && not visited.[nr].[nc]
                then
                    visited.[nr].[nc] <- true
                    q.Enqueue(nr, nc)

                    if (nr, nc) = goal then
                        found <- true

        found

    if isSolvable then
        (m, start, goal)
    else
        generateSolvableMaze rows cols

let m, start, goal = generateSolvableMaze 8 14
maze <- m
startPos <- start
goalPos <- goal



let drawMaze () =
    let canvas = document.getElementById "maze-canvas" :?> HTMLCanvasElement
    let ctx = canvas.getContext_2d ()
    let rows, cols = maze.Length, maze.[0].Length
    let cellSize = float canvas.width / float cols

    // Очистим всё
    ctx.clearRect (0.0, 0.0, canvas.width, canvas.height)

    // Нарисуем клетки
    for row in 0 .. rows - 1 do
        for col in 0 .. cols - 1 do
            let x = float col * cellSize
            let y = float row * cellSize

            ctx.fillStyle <- if maze.[row].[col] = 1 then !!"#000000" else !!"#ffffff"
            ctx.fillRect (x, y, cellSize, cellSize)
            ctx.strokeStyle <- !!"#cccccc"
            ctx.strokeRect (x, y, cellSize, cellSize)

    let gx, gy = goalPos

    if gx >= 0 && gx < rows && gy >= 0 && gy < cols && maze.[gx].[gy] = 0 then
        ctx.fillStyle <- !!"red"
        ctx.beginPath ()

        ctx.arc (
            float gy * cellSize + cellSize / 2.0,
            float gx * cellSize + cellSize / 2.0,
            cellSize / 3.0,
            0.0,
            2.0 * System.Math.PI
        )

        ctx.fill ()

    // 🟢 Нарисуем вход (startPos)
    let sx, sy = startPos

    if sx >= 0 && sx < rows && sy >= 0 && sy < cols && maze.[sx].[sy] = 0 then
        ctx.fillStyle <- !!"limegreen"
        ctx.beginPath ()

        ctx.arc (
            float sy * cellSize + cellSize / 2.0,
            float sx * cellSize + cellSize / 2.0,
            cellSize / 3.0,
            0.0,
            2.0 * System.Math.PI
        )

        ctx.fill ()




let animatePath (canvas: HTMLCanvasElement) (path: (int * int) list) =
    let ctx = canvas.getContext_2d ()
    let cellSize = float canvas.width / float maze.[0].Length

    let rec loop index =
        if index < path.Length then
            let (r, c) = path.[index]
            let x = float c * cellSize + cellSize / 2.0
            let y = float r * cellSize + cellSize / 2.0

            ctx.fillStyle <- !!"limegreen"
            ctx.beginPath ()
            ctx.arc (x, y, cellSize / 4.0, 0.0, 2.0 * System.Math.PI)
            ctx.fill ()

            window.setTimeout ((fun () -> loop (index + 1)), 100) |> ignore

    loop 0

let solveMaze () =
    if isSolving then
        console.warn ("Maze is currently being solved.")
    else
        isSolving <- true

        let canvas = document.getElementById "maze-canvas" :?> HTMLCanvasElement
        let ctx = canvas.getContext_2d ()
        let rows, cols = maze.Length, maze.[0].Length
        let start = startPos
        let goal = goalPos

        let visited = Array.init rows (fun _ -> Array.create cols false)
        let parent = Array.init rows (fun _ -> Array.create cols None)

        let q = System.Collections.Generic.Queue()
        q.Enqueue(start)
        visited.[fst start].[snd start] <- true

        let directions = [| (0, -1); (-1, 0); (0, 1); (1, 0) |]
        let rand = System.Random()

        let shuffledDirections () =
            directions |> Array.sortBy (fun _ -> rand.Next())

        let mutable found = false

        while q.Count > 0 && not found do
            let (r, c) = q.Dequeue()

            for (dr, dc) in shuffledDirections () do
                let nr, nc = r + dr, c + dc

                if
                    nr >= 0
                    && nc >= 0
                    && nr < rows
                    && nc < cols
                    && maze.[nr].[nc] = 0
                    && not visited.[nr].[nc]
                then
                    visited.[nr].[nc] <- true
                    parent.[nr].[nc] <- Some(r, c)
                    q.Enqueue(nr, nc)

                    if (nr, nc) = goal then
                        found <- true

        if found then
            let mutable path = [ goal ]
            let mutable curr = goal

            while curr <> start do
                match parent.[fst curr].[snd curr] with
                | Some p ->
                    path <- p :: path
                    curr <- p
                | None -> failwith "No path"

            animatePath canvas path

            window.setTimeout ((fun () -> isSolving <- false), path.Length * 100 + 200)
            |> ignore
        else
            console.warn ("No path found")
            isSolving <- false






let handleCanvasClick (x, y, cls) =
    points <- { X = x; Y = y; Class = cls } :: points
    drawPoints ()
    updateWeightsDisplay ()
    updateConfusionMatrix ()



let rec trainUntilPerfect epoch =
    let mutable hasError = false

    for p in points do
        let input = [| p.X; p.Y |]
        let target = float p.Class
        let sum = input.[0] * weights.[0] + input.[1] * weights.[1] + bias
        let output = if sum >= 0.0 then 1.0 else 0.0
        let error = target - output

        if error <> 0.0 then
            hasError <- true
            let lr = learningRate
            weights.[0] <- weights.[0] + lr * error * input.[0]
            weights.[1] <- weights.[1] + lr * error * input.[1]
            bias <- bias + lr * error

            appendLog (
                sprintf
                    "Epoch %d: Δw0 = %.4f, Δw1 = %.4f, Δb = %.4f"
                    epoch
                    (lr * error * input.[0])
                    (lr * error * input.[1])
                    (lr * error)
            )


    drawPoints ()
    updateWeightsDisplay ()
    updateConfusionMatrix ()

    if hasError && epoch < 200 then
        ignore (window.requestAnimationFrame (fun _ -> trainUntilPerfect (epoch + 1)))
    else
        let msg =
            if hasError then
                "Training stopped after 200 epochs with some errors."
            else
                "Training completed successfully without errors!"

        window.alert msg

let startTraining () =
    if isMazeMode then
        solveMaze ()
    else
        let log = document.getElementById "training-log"

        if log <> null then
            log.innerHTML <- ""

        trainUntilPerfect 0


let randomizeWeights () =
    let rand () = JS.Math.random () * 2.0 - 1.0
    weights <- [| rand (); rand () |]
    bias <- rand ()
    drawPoints ()
    updateWeightsDisplay ()
    updateConfusionMatrix ()

let resetPoints () =
    if isMazeMode then
        let m, start, goal = generateSolvableMaze 8 14
        maze <- m
        startPos <- start
        goalPos <- goal
        drawMaze ()
    else
        points <- []
        drawPoints ()
        updateWeightsDisplay ()
        updateConfusionMatrix ()




let onBtn id action =
    let el = document.getElementById id

    if isNull el then
        console.warn (sprintf "Element with id '%s' not found" id)
    else
        el.addEventListener ("click", fun _ -> action ())

let showHelpModal () =
    let existing = document.getElementById "help-modal"

    if existing <> null then
        if existing.classList.contains "hidden" then
            existing.classList.remove "hidden"
        else
            existing.classList.add "hidden"
    else
        let helpBtn = document.getElementById "btn-help"
        let rect = helpBtn.getBoundingClientRect ()
        let modal = document.createElement "div"
        modal.id <- "help-modal"
        modal.className <- "absolute bg-white rounded p-6 shadow-lg border w-[32rem] z-50 text-sm leading-relaxed"
        modal.setAttribute ("style", $"top:{rect.bottom + 10.0}px;left:{rect.left - 320.0}px;")

        modal.innerHTML <-
            """
            <h2 class="text-xl font-semibold mb-3">About this Project</h2>
<p>This interactive project demonstrates two classic AI approaches in action:</p>

<h3 class="font-semibold mt-4">🧠 Perceptron Mode</h3>
<p>A perceptron is a basic neural unit that learns to separate 2D points into two classes using linear boundaries.</p>
<ul class="list-disc list-inside mt-1">
  <li>Click on canvas to add blue (Class 0) or red (Class 1) points</li>
  <li>Train the perceptron to learn the boundary</li>
  <li>The decision boundary is shown as a black line</li>
  <li>The background color indicates prediction confidence</li>
</ul>

<h3 class="font-semibold mt-4">🧩 Maze Mode</h3>
<p>In this mode, an agent uses Breadth-First Search (BFS) to solve a procedurally generated maze.</p>
<ul class="list-disc list-inside mt-1">
  <li>Click <b>Train</b> to start pathfinding</li>
  <li>The green dot animates as it finds the path</li>
  <li>All mazes are guaranteed to have one valid solution</li>
</ul>

<h3 class="font-semibold mt-4">🛠️ Tech Stack</h3>
<ul class="list-disc list-inside mt-1">
  <li>F# + Fable (compiled to JavaScript)</li>
  <li>HTML Canvas</li>
  <li>Tailwind CSS</li>
</ul>

<p class="mt-4">Made by Dmitrii Drugov – HFAA90</p>
<button id="close-help" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>

            """

        document.body.appendChild modal |> ignore
        let closeBtn = modal.querySelector "#close-help" :?> HTMLButtonElement
        closeBtn.addEventListener ("click", fun _ -> modal.classList.add "hidden")

let canvasElement = Components.Canvas.render handleCanvasClick

let mazeCanvas = document.createElement "canvas"
mazeCanvas.id <- "maze-canvas"
mazeCanvas.setAttribute ("width", "600") |> ignore
mazeCanvas.setAttribute ("height", "400") |> ignore

mazeCanvas.className <- "hidden border rounded bg-white"

let header = Header.render ()
let visualizer = Visualizer.render ()
let controls = ControlPanel.render ()

let app = document.createElement "div"

app.className <-
    "min-h-screen bg-gray-100 flex flex-col items-center gap-4 pt-10 max-w-screen-xl w-full mx-auto overflow-x-hidden"

visualizer.appendChild canvasElement |> ignore
visualizer.appendChild mazeCanvas |> ignore

app.appendChild header |> ignore
let modeSwitcher = document.createElement "button"
modeSwitcher.textContent <- "Switch to Maze Mode"
modeSwitcher.className <- "bg-gray-200 px-4 py-2 rounded border shadow hover:bg-gray-300"
modeSwitcher.id <- "btn-switch-mode"



modeSwitcher.addEventListener (
    "click",
    fun _ ->
        isMazeMode <- not isMazeMode

        let perceptronCanvas = document.getElementById "perceptron-canvas"
        let mazeCanvas = document.getElementById "maze-canvas"

        if isMazeMode then
            modeSwitcher.textContent <- "Switch to Perceptron Mode"
            perceptronCanvas.classList.add "hidden"
            mazeCanvas.classList.remove "hidden"
            drawMaze ()
        else
            modeSwitcher.textContent <- "Switch to Maze Mode"
            mazeCanvas.classList.add "hidden"
            perceptronCanvas.classList.remove "hidden"
)


app.appendChild modeSwitcher |> ignore


app.appendChild visualizer |> ignore
app.appendChild controls |> ignore

document.getElementById("root").appendChild app |> ignore

onBtn "btn-train" startTraining
onBtn "btn-reset" resetPoints
onBtn "btn-random" randomizeWeights
onBtn "btn-help" showHelpModal

setupLearningRateInput ()
updateWeightsDisplay ()
updateConfusionMatrix ()
