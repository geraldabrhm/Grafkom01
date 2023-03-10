import {
  vertexShaderGLSL,
  fragmentShaderGLSL,
  vertexShaderGLSL2,
  fragmentShaderGLSL2,
} from "../../modules/shader.js";
import { createShader, createProgram } from "../../modules/generator.js";
import {
  getRelativePosition,
  rotatePoints,
  rotateSquare,
  hexToRGB,
} from "../../modules/transform-utils.js";

// * Setting up a WebGL context
const canvas = document.querySelector("#draw-surface");
const gl = canvas.getContext("webgl");

// * Creating, loading and compiling shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderGLSL2);
const fragmentShader = createShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderGLSL2
);

const program = createProgram(gl, vertexShader, fragmentShader);
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const colorAttributeLocation = gl.getAttribLocation(program, "a_color");

let polygons = []; // array of polygon object

const positionBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();

const angleUniformLocation = gl.getUniformLocation(program, "angle");
let angle = 0;
let stopRotation = false;

// * Drawing the initial line
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program); // Execute shader program

function render() {
  if (!stopRotation) {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Update the angle
    angle += 0.01;
    gl.uniform1f(angleUniformLocation, angle);

    // Draw the square
    drawAllPolygons();
  }

  // Request the next frame
  requestAnimationFrame(render);
}
const runButton = document.getElementById("runButton");
runButton.addEventListener("click", () => {
  stopRotation = false;
  requestAnimationFrame(render);
});
const stopButton = document.getElementById("stopButton");
stopButton.addEventListener("click", () => {
  stopRotation = true;
});

// handle select side event
const selectSide = document.querySelector("#select-side");
const sliderTranslasiX = document.querySelector("#translasi-x-slider");
const sliderTranslasiY = document.querySelector("#translasi-y-slider");

selectSide.addEventListener("change", (e) => {
  const numVertices = parseInt(e.target.value);
  if (!isNaN(numVertices) && selectedIndex !== -1) {
    // Update the vertices array for the selected polygon
    const polygon = polygons[selectedIndex];
    const oldNumVertices = polygon.vertices.length / 2;
    const newNumVertices = numVertices < 3 ? 3 : numVertices;

    if (oldNumVertices !== newNumVertices) {
      const vertices = polygon.vertices;
      const centerX = (vertices[0] + vertices[2] + vertices[4]) / 3;
      const centerY = (vertices[1] + vertices[3] + vertices[5]) / 3;
      const radius = Math.sqrt(
        Math.pow(vertices[0] - centerX, 2) + Math.pow(vertices[1] - centerY, 2)
      );
      const newVertices = [];
      for (let i = 0; i < newNumVertices; i++) {
        const angle = (2 * Math.PI * i) / newNumVertices;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        newVertices.push(x, y);
      }
      polygon.vertices = newVertices;
    }

    // add the color matrix
    const colors = polygon.colors;
    const oldNumColors = colors.length / 4;
    const newNumColors = newNumVertices;
    if (oldNumColors !== newNumColors) {
      const newColors = [];
      for (let i = 0; i < newNumColors; i++) {
        newColors.push(1, 0, 0, 1);
      }
      polygon.colors = newColors;
    }
  }

  drawAllPolygons();
});

const drawAllPolygons = () => {
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (let i = 0; i < polygons.length; i++) {
    drawPolygon(polygons[i]);
  }
};

const drawPolygon = (polygon) => {
  const { vertices, colors } = polygon;

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
};

// handle create polygon
const polygonLoader = document.querySelector("#loader");
polygonLoader.addEventListener("click", (e) => {
  let numSides = 3;
  let angle = (2 * Math.PI) / numSides;
  let vertices = [];
  let colors = [];
  console.log("creating new pl");

  for (var i = 0; i < numSides; i++) {
    vertices.push(0.5 * Math.cos(i * angle));
    vertices.push(0.5 * Math.sin(i * angle));
  }

  for (var i = 0; i < numSides; i++) {
    colors.push(1);
    colors.push(0);
    colors.push(0);
    colors.push(1);
  }

  const polygon = {
    vertices,
    colors,
  };

  polygons.push(polygon);
  console.log("created : ", polygon);
  drawAllPolygons();
});

// remove selected vertex

const removeVertex = document.querySelector("#remove-vertex");
removeVertex.addEventListener("click", (e) => {
  if (selectedIndex !== -1) {
    const polygon = polygons[selectedIndex];
    const numVertices = polygon.vertices.length / 2;
    if (numVertices > 3) {
      polygon.vertices.splice(selectedVertices * 2, 2);
      polygon.colors.splice(selectedVertices * 4, 4);
    }
  }

  drawAllPolygons();
});

sliderTranslasiX.addEventListener("input", (e) => {
  let selectedPolygon = polygons[selectedIndex];
  const shiftVal = sliderTranslasiX.value - selectedPolygon.vertices[0];

  selectedPolygon.vertices.forEach((val, idx) => {
    if (idx % 2 === 0) {
      selectedPolygon.vertices[idx] += shiftVal;
    }
  });

  drawAllPolygons();
});

sliderTranslasiY.addEventListener("input", (e) => {
  let selectedPolygon = polygons[selectedIndex];
  const shiftVal = sliderTranslasiY.value - selectedPolygon.vertices[1];
  selectedPolygon.vertices.forEach((val, idx) => {
    if (idx % 2 === 1) {
      selectedPolygon.vertices[idx] += shiftVal;
    }
  });
  drawAllPolygons();
});

// * Handle vertex draging event
let selectedIndex = null;
let selectedVertices = null;
let dragging = false;
const rect = canvas.getBoundingClientRect();

const picker = (e, vertices) => {
  const x = e.clientX;
  const y = e.clientY;
  const valNormalize = getRelativePosition(x, y, rect);
  const proportionToCanvasSize = 15 / rect.width;
  console.log("valNormalize : ", valNormalize);

  for (let i = 0; i < vertices.length; i++) {
    if (
      Math.abs(vertices[i] - valNormalize[0]) < proportionToCanvasSize &&
      Math.abs(vertices[i + 1] - valNormalize[1]) < proportionToCanvasSize
    ) {
      console.log("selected vertex : ", i / 2);
      return i;
    }
  }
  return -1;
};

canvas.addEventListener("mousedown", (e) => {
  const pickedInfo = document.querySelector("#picked-info");

  // Get the mouse position relative to top left of web view
  let x = e.clientX;
  let y = e.clientY;
  console.log("down");

  const valNormalize = getRelativePosition(x, y, rect);
  const proportionToCanvasSize = 15 / rect.width;

  for (let i = 0; i < polygons.length; i++) {
    const polygon = polygons[i];
    const vertices = polygon.vertices;
    let inside = false;
    for (let j = 0; j < vertices.length; j += 2) {
      const x1 = vertices[j];
      const y1 = vertices[j + 1];
      const x2 = vertices[(j + 2) % vertices.length];
      const y2 = vertices[(j + 3) % vertices.length];
      if (
        ((y1 <= valNormalize[1] && valNormalize[1] < y2) ||
          (y2 <= valNormalize[1] && valNormalize[1] < y1)) &&
        valNormalize[0] < ((x2 - x1) / (y2 - y1)) * (valNormalize[1] - y1) + x1
      ) {
        inside = !inside;

        selectedVertices = picker(e, polygons[i].vertices);
        if (selectedVertices !== -1) {
          removeVertex.removeAttribute("disabled");

          sliderTranslasiX.value = vertices[selectedVertices];
          sliderTranslasiY.value = vertices[selectedVertices + 1];
          dragging = true;
        } else {
          sliderTranslasiX.value = vertices[0];
          sliderTranslasiY.value = vertices[1];
          dragging = false;
        }
      }
    }
    if (inside) {
      selectedIndex = i;
      sliderTranslasiX.removeAttribute("disabled");
      sliderTranslasiY.removeAttribute("disabled");
      sliderRotasi.removeAttribute("disabled");
      colorPicker.removeAttribute("disabled");
      pickedInfo.removeAttribute("hidden");
      pickedInfo.innerHTML = `<b>Selected:</b> vertex with index ${selectedVertices} of polygon with index ${selectedIndex}`;
      console.log(
        "polygon: ",
        polygon,
        "with index: ",
        selectedIndex,
        "with vertices index",
        selectedVertices,
        "is clicked"
      );
      break;
    } else {
      pickedInfo.setAttribute("hidden", true);
      sliderTranslasiX.setAttribute("disabled", true);
      sliderTranslasiY.setAttribute("disabled", true);
      sliderRotasi.setAttribute("disabled", true);
      colorPicker.setAttribute("disabled", true);
    }
  }
});

canvas.addEventListener("mouseup", (e) => {
  dragging = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (dragging) {
    // Get the mouse position relative to top left of web view
    let x = e.clientX;
    let y = e.clientY;
    let selectedPolygon = polygons[selectedIndex];

    const valNormalize = getRelativePosition(x, y, rect);

    selectedPolygon.vertices[selectedVertices] = valNormalize[0];
    selectedPolygon.vertices[selectedVertices + 1] = valNormalize[1];
    drawAllPolygons();
  }
});

const sliderRotasi = document.querySelector("#rotasi-slider");

function getPolygonCentroid(vertices) {
  let xSum = 0;
  let ySum = 0;
  const n = vertices.length / 2;

  for (let i = 0; i < vertices.length; i += 2) {
    xSum += vertices[i];
    ySum += vertices[i + 1];
  }

  const xCentroid = xSum / n;
  const yCentroid = ySum / n;

  return [xCentroid, yCentroid];
}

// handle polygon rotation event slider
sliderRotasi.addEventListener("input", (e) => {
  const angle = (2 * Math.PI * sliderRotasi.value) / 360;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let selectedPolygon = polygons[selectedIndex];
  const [centerX, centerY] = getPolygonCentroid(
    polygons[selectedIndex].vertices
  );

  for (var i = 0; i < selectedPolygon.vertices.length; i += 2) {
    const x = selectedPolygon.vertices[i] - centerX;
    const y = selectedPolygon.vertices[i + 1] - centerY;

    selectedPolygon.vertices[i] = x * cos - y * sin + centerX;
    selectedPolygon.vertices[i + 1] = x * sin + y * cos + centerY;
  }
  drawAllPolygons();
});

// handle color picker event
const colorPicker = document.querySelector("#color-picker");

colorPicker.addEventListener("input", (e) => {
  const rgbVal = hexToRGB(colorPicker.value);
  let selectedPolygon = polygons[selectedIndex];
  let colors = selectedPolygon.colors;

  console.log(selectedVertices);
  console.log(selectedPolygon, colors);

  if (selectedVertices == -1) {
    for (let i = 0; i < colors.length; i += 4) {
      console.log("masuk");
      console.log("i");
      console.log("panjang", colors.length);

      colors[i] = rgbVal.r / 255;
      colors[i + 1] = rgbVal.g / 255;
      colors[i + 2] = rgbVal.b / 255;
      colors[i + 3] = 1;
    }
  } else {
    let colorindex = (selectedVertices / 2) * 4;
    colors[colorindex] = rgbVal.r / 255;
    colors[colorindex + 1] = rgbVal.g / 255;
    colors[colorindex + 2] = rgbVal.b / 255;
    colors[colorindex + 3] = 1;
  }
  drawAllPolygons();
});

// handle save to json file
const saveBtn = document.querySelector("#save-btn");
saveBtn.addEventListener("click", (e) => {
  const data = polygons;
  const dataStr = JSON.stringify(data);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = "data.json";

  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
});

// handle load from json file
const loadBtn = document.querySelector("#load-btn");
loadBtn.addEventListener("click", (e) => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      const data = JSON.parse(result);
      polygons.push(...data);

      drawAllPolygons();
    };
    reader.readAsText(file);
  };
  fileInput.click();
});
