import { vertexShaderGLSL, fragmentShaderGLSL } from "../../modules/shader.js";
import { createShader, createProgram } from "../../modules/generator.js";
import {
  getRelativePosition,
  rotatePoints,
} from "../../modules/transform-utils.js";

// * Setting up a WebGL context
const canvas = document.querySelector("#draw-surface");
const gl = canvas.getContext("webgl");

// * Creating, loading and compiling shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderGLSL);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderGLSL);

const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const colorUniformLocation = gl.getUniformLocation(program, "u_color");

// setting up the initial vertexs = 3
var positions = [];
var numSides = 3;
var angle = (2 * Math.PI) / numSides;
for (var i = 0; i < numSides; i++) {
  positions.push(0.5 * Math.cos(i * angle));
  positions.push(0.5 * Math.sin(i * angle));
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// * Drawing the initial line
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program); // Execute shader program

gl.enableVertexAttribArray(positionAttributeLocation);
gl.uniform4f(colorUniformLocation, 0.5, 0.7, 0.5, 1);

gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 2);

// handle select side event
const selectSide = document.querySelector("#select-side");
const sliderTranslasiX = document.querySelector("#translasi-x-slider");
const sliderTranslasiY = document.querySelector("#translasi-y-slider");

selectSide.addEventListener("change", (e) => {
  const numSides = parseInt(e.target.value);
  const angle = (2 * Math.PI) / numSides;
  positions.length = 0;
  for (var i = 0; i < numSides; i++) {
    positions.push(0.5 * Math.cos(i * angle));
    positions.push(0.5 * Math.sin(i * angle));
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Redraw the line
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 2);
});

// handle translasi event

const drawPolygon = (positions, positionBuffer) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Redraw the line
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 2);
};

sliderTranslasiX.addEventListener("input", (e) => {
  const shiftVal = sliderTranslasiX.value - positions[0];
  positions.forEach((val, idx) => {
    if (idx % 2 === 0) {
      positions[idx] += shiftVal;
    }
  });
  console.log("positions: ", positions);
  console.log("numSides", numSides);
  drawPolygon(positions, positionBuffer);
});

sliderTranslasiY.addEventListener("input", (e) => {
  const shiftVal = sliderTranslasiY.value - positions[1];
  positions.forEach((val, idx) => {
    if (idx % 2 === 1) {
      positions[idx] += shiftVal;
    }
  });
  console.log("positions: ", positions);
  console.log("numSides", numSides);
  drawPolygon(positions, positionBuffer);
});

// * Handle mouse event
let selectedIndex = null;
let dragging = false;
const rect = canvas.getBoundingClientRect();

canvas.addEventListener("mousedown", (e) => {
  // Get the mouse position relative to top left of web view
  let x = e.clientX;
  let y = e.clientY;

  const valNormalize = getRelativePosition(x, y, rect);

  const proportionToCanvasSize = 15 / rect.width;

  // Iterate through vertexs to find the vertex in particular distances range
  for (var i = 0; i < positions.length; i += 2) {
    if (
      Math.abs(positions[i] - valNormalize[0]) < proportionToCanvasSize &&
      Math.abs(positions[i + 1] - valNormalize[1]) < proportionToCanvasSize
    ) {
      selectedIndex = i;
      dragging = true;
      break;
    }
  }
  console.log("positions: ", positions);
  console.log("numSides", numSides);
});

canvas.addEventListener("mouseup", (e) => {
  dragging = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (dragging) {
    // Get the mouse position relative to top left of web view
    let x = e.clientX;
    let y = e.clientY;

    const valNormalize = getRelativePosition(x, y, rect);

    positions[selectedIndex] = valNormalize[0];
    positions[selectedIndex + 1] = valNormalize[1];
    console.log("positions: ", positions);
    console.log("numSides", numSides);
    drawPolygon(positions, positionBuffer);
  }
});

const sliderRotasi = document.querySelector("#rotasi-slider");

// handle polygon rotation event slider
sliderRotasi.addEventListener("input", (e) => {
  const angle = (2 * Math.PI * sliderRotasi.value) / 360;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const centerX = 0;
  const centerY = 0;

  for (var i = 0; i < positions.length; i += 2) {
    const x = positions[i] - centerX;
    const y = positions[i + 1] - centerY;

    positions[i] = x * cos - y * sin + centerX;
    positions[i + 1] = x * sin + y * cos + centerY;
  }
  console.log("positions: ", positions);
  console.log("numSides", numSides);

  drawPolygon(positions, positionBuffer);
});

// handle save to json file
const saveBtn = document.querySelector("#save-btn");
saveBtn.addEventListener("click", (e) => {
  const data = {
    positions,
    numSides,
  };
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
      positions = data.positions;
      numSides = data.numSides;
      selectSide.value = numSides;
      drawPolygon(positions, positionBuffer);
    };
    reader.readAsText(file);
  };
  fileInput.click();
});
