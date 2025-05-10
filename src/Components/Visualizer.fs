module Components.Visualizer

open Browser.Dom

let render () =
    let container = document.createElement "div"
    container.className <- "flex flex-col md:flex-row gap-6 items-start justify-center w-full max-w-6xl"

    // Обёртка для confusion matrix + лог
    let metricsWrapper = document.createElement "div"
    metricsWrapper.className <- "bg-white border shadow rounded p-4 w-64 text-sm"
    metricsWrapper.id <- "metrics-container"

    // Таблица будет заменяться динамически
    metricsWrapper.innerHTML <-
        """
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
                    <td class="border">TN<br><strong>0</strong></td>
                    <td class="border">FP<br><strong>0</strong></td>
                </tr>
                <tr>
                    <th>Actual 1</th>
                    <td class="border">FN<br><strong>0</strong></td>
                    <td class="border">TP<br><strong>0</strong></td>
                </tr>
            </tbody>
        </table>
        <div id="training-log" class="text-xs whitespace-pre-wrap font-mono bg-white p-2 border rounded mt-4 max-h-48 overflow-y-auto"></div>
    """



    container.appendChild metricsWrapper |> ignore

    container
