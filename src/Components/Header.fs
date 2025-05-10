module Components.Header

open Browser.Dom

let render () =
    let wrapper = document.createElement "div"
    wrapper.className <- "relative w-full flex items-center justify-center h-16 bg-white mb-4"

    let title = document.createElement "h1"
    title.className <- "text-3xl font-bold text-blue-700"
    title.textContent <- "AI Playground: Perceptron & Maze Solver"

    let helpBtn = document.createElement "button"

    helpBtn.className <-
        "absolute right-6 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"

    helpBtn.textContent <- "Help"
    helpBtn.id <- "btn-help"

    wrapper.appendChild title |> ignore
    wrapper.appendChild helpBtn |> ignore
    wrapper
