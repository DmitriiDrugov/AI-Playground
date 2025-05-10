module Components.Modal

open Browser.Dom

let render () =
    let overlay = document.createElement "div"
    overlay.id <- "modal-overlay"

    overlay.className <-
        "fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50 hidden"

    let modal = document.createElement "div"
    modal.className <- "bg-white rounded p-6 shadow-lg max-w-md text-sm text-gray-800"

    let title = document.createElement "h2"
    title.className <- "text-lg font-bold mb-2"
    title.textContent <- "About Neural Net Visualizer"

    let body = document.createElement "p"

    body.textContent <-
        "This project demonstrates how a simple perceptron learns to classify points into two categories. \
        You can add red and blue points, then train the model to adjust weights and draw a decision boundary."

    let close = document.createElement "button"
    close.className <- "mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    close.textContent <- "Close"

    close.addEventListener ("click", fun _ -> overlay.classList.add ("hidden"))

    modal.appendChild title |> ignore
    modal.appendChild body |> ignore
    modal.appendChild close |> ignore
    overlay.appendChild modal |> ignore
    overlay
