const modelOption = document.querySelector("#model-option");

// Dynamic element
const runButton = document.querySelector("#runButton");
const stopButton = document.querySelector("#stopButton");
const polygonSide = document.querySelector("#polygon-select-side");
const removeVertex = document.querySelector("#remove-vertex");

modelOption.addEventListener("change", (e) => {
  // * Set up dynamic script

  const scriptElement = document.createElement("script");
  scriptElement.id = "model-script";
  scriptElement.type = "module";
  scriptElement.src = modelOption.value;

  const oldScriptElement = document.querySelector("#model-script");
  if (oldScriptElement) {
    oldScriptElement.remove();
  }

  document.head.appendChild(scriptElement);

  // * Handling dynamic element (hide and show): List all dynamic element here
  runButton.style.visibility = "hidden";
  stopButton.style.visibility = "hidden";
  polygonSide.style.visibility = "hidden";
  removeVertex.style.visibility = "hidden";
  switch (modelOption.value) {
    // TODO Handler dynamic html element in particular model
    case "model/line/app.js":
	  runButton.style.visibility = "visible";
	  stopButton.style.visibility = "visible";
      break;
    case "model/polygon/app.js":
      polygonSide.style.visibility = "visible";
      removeVertex.style.visibility = "visible";
      runButton.style.visibility = "visible";
      stopButton.style.visibility = "visible";
      break;
    case "model/rectangle/app.js":
      runButton.style.visibility = "visible";
      stopButton.style.visibility = "visible";
      break;
    case "model/square/app.js":
      runButton.style.visibility = "visible";
      stopButton.style.visibility = "visible";
      break;
  }
});
