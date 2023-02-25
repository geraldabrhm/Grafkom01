const modelOption = document.querySelector("#model-option")

window.addEventListener("load", e => {
    localStorage.setItem("state", modelOption.value) // Default value
})

modelOption.addEventListener("change", e => {
    localStorage.setItem("state", modelOption.value)
    const state = localStorage.getItem("state")

    // Handling item in canvas modifier that exclusive to line model
    const lineLoader = document.querySelector("#line-loader")
    if(state != "line") {
        lineLoader.style.display = "none"
    } else {
        lineLoader.style.display = "block"
    }
})