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
// gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
// gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
// gl.enableVertexAttribArray(positionAttributeLocation);

const colorBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
// gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
// gl.enableVertexAttribArray(colorAttributeLocation);

// * Drawing the initial line
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program); // Execute shader program

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

  drawPolygon(positions, positionBuffer, colors, colorBuffer);
});

const drawAllPolygons = () => {
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (let i = 0; i < polygons.length; i++) {
    drawPolygon(polygons[i]);
  }
};

const drawPolygon = (polygon) => {
  console.log("drawing polygon");
  console.log("polygons :", polygons);

  const { vertices, colors } = polygon;

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

  console.log("printing vertices", vertices);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
};

// handle create polygon
const polygonLoader = document.querySelector("#polygon-loader");
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
  const shiftVal = sliderTranslasiY.value - selectedPolygon.vertices[0];
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
  console.log("proportion", proportionToCanvasSize);
  console.log("vertddddx", vertices);

  for (let i = 0; i < vertices.length; i++) {
    console.log(" A ", vertices[i] - valNormalize[0]);
    console.log(" V ", vertices[i + 1] - valNormalize[1]);

    if (
      Math.abs(vertices[i] - valNormalize[0]) < proportionToCanvasSize &&
      Math.abs(vertices[i + 1] - valNormalize[1]) < proportionToCanvasSize
    ) {
      return i;
    }
  }

  return -1;
};

canvas.addEventListener("mousedown", (e) => {
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
          dragging = true;
        }
      }
    }
    if (inside) {
      selectedIndex = i;
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
    selectedVertices = -1; // reset selectedVertices
  } else {
    let colorindex = (selectedVertices / 2) * 4;
    colors[colorindex] = rgbVal.r / 255;
    colors[colorindex + 1] = rgbVal.g / 255;
    colors[colorindex + 2] = rgbVal.b / 255;
    colors[colorindex + 3] = 1;
    selectedVertices = -1; // reset selectedVertices
  }
  drawAllPolygons();
});

// handle save to json file
const saveBtn = document.querySelector("#save-btn");
saveBtn.addEventListener("click", (e) => {
  const data = {
    positions,
    numSides,
    type,
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

      drawPolygon(positions, positionBuffer, colors, colorBuffer);
    };
    reader.readAsText(file);
  };
  fileInput.click();
});
