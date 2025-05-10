module Components.ControlPanel

open Browser.Dom

let render () =
    let wrapper = document.createElement "div"
    wrapper.className <- "w-full max-w-4xl flex flex-col md:flex-row gap-4"

    let buttonsBox = document.createElement "div"
    buttonsBox.className <- "flex-1 bg-white p-4 rounded shadow border border-gray-300 flex flex-col gap-2"

    let btnTrain = document.createElement "button"
    btnTrain.className <- "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    btnTrain.textContent <- "Train"
    btnTrain.id <- "btn-train"

    let btnReset = document.createElement "button"
    btnReset.className <- "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    btnReset.textContent <- "Reset"
    btnReset.id <- "btn-reset"

    let btnRandom = document.createElement "button"
    btnRandom.className <- "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    btnRandom.textContent <- "Random weight"
    btnRandom.id <- "btn-random"

    let csvInput = document.createElement "input"
    csvInput.setAttribute ("type", "file")
    csvInput.setAttribute ("accept", ".csv")
    csvInput.className <- "px-2 py-1 border rounded text-sm"
    csvInput.id <- "csv-input"



    [ btnTrain; btnReset; btnRandom; csvInput ]
    |> List.iter (buttonsBox.appendChild >> ignore)

    let settingsBox = document.createElement ("div") :?> Browser.Types.HTMLDivElement
    settingsBox.className <- "flex-1 bg-white p-4 rounded shadow border border-gray-300"
    settingsBox.id <- "settings-box"

    let html =
        """
    <div class="text-sm text-gray-800 space-y-2">
      <label class="block">
        <span class="text-gray-600 font-medium">Learning rate: <span id="lr-display">0.1</span></span>
        <input id="learning-rate-input" type="range" step="0.01" min="0.01" max="1" value="0.1"
          class="mt-1 block w-full cursor-pointer" oninput="document.getElementById('lr-display').innerText = this.value" />
      </label>
      <div id="weights-display" class="pt-2"></div>
    </div>
    """

    settingsBox.innerHTML <- html

    wrapper.appendChild (buttonsBox) |> ignore
    wrapper.appendChild (settingsBox) |> ignore
    wrapper
