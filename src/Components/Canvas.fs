module Components.Canvas

open Browser.Dom
open Browser.Types
open Fable.Core.JsInterop

let render (onClick: float * float * int -> unit) =
    let canvas = document.createElement "canvas" :?> HTMLCanvasElement
    canvas.className <- "border border-blue-300 bg-white"
    canvas.id <- "perceptron-canvas"
    canvas.width <- 700.
    canvas.height <- 500.

    // Левая кнопка мыши
    canvas.addEventListener (
        "click",
        fun ev ->
            let ev = ev :?> MouseEvent
            let rect = canvas.getBoundingClientRect ()
            let x = ev.clientX - rect.left
            let y = ev.clientY - rect.top
            let width = canvas.width
            let height = canvas.height

            let xNorm = (x / float width) * 2.0 - 1.0
            let yNorm = -((y / float height) * 2.0 - 1.0)

            onClick (xNorm, yNorm, 0) // Класс 0 — синий

    )

    // Правая кнопка мыши
    canvas.addEventListener (
        "contextmenu",
        fun ev ->
            ev.preventDefault () // отключаем стандартное меню
            let ev = ev :?> MouseEvent
            let rect = canvas.getBoundingClientRect ()
            let x = ev.clientX - rect.left
            let y = ev.clientY - rect.top
            let width = canvas.width
            let height = canvas.height

            let xNorm = (x / float width) * 2.0 - 1.0
            let yNorm = -((y / float height) * 2.0 - 1.0)

            onClick (xNorm, yNorm, 1) // Класс 1 — красный

    )

    canvas
