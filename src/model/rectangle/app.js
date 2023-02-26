import { vertexShaderGLSL, fragmentShaderGLSL } from "../../modules/shader.js";
import { createShader, createProgram } from "../../modules/generator.js";
import { getRelativePosition, rotateSquare } from "../../modules/transform-utils.js";

const canvas = document.querySelector('#draw-surface');
const gl = canvas.getContext('webgl');

// Define the vertices of the square
const vertices = [
    -0.75, -0.5,
    0.75, -0.5,
    0.75, 0.5,
    -0.75, 0.5,
];

// Create a buffer to store the vertices
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Create a vertex shader
const vertexShaderSource = `
attribute vec2 a_position;
uniform float angle;
void main() {
  float s = sin(angle);
  float c = cos(angle);
  mat3 rotation = mat3(c, s, 0, -s, c, 0, 0, 0, 1);
  gl_Position = vec4(rotation * vec3(a_position, 1), 1);
}
`;
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

// Create a fragment shader
const fragmentShaderSource = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// Create a program and attach the shaders
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

// Bind the vertex buffer to the program
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionAttributeLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// Set up the uniform variable
const angleUniformLocation = gl.getUniformLocation(program, 'angle');
let angle = 0;
let stopRotation = false;

// Render loop
function render() {
    if (!stopRotation) {
        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Update the angle
        angle += 0.01;
        gl.uniform1f(angleUniformLocation, angle);

        // Draw the square
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    // Request the next frame
    requestAnimationFrame(render);
}
const runButton = document.getElementById('runButton');
runButton.addEventListener('click', () => {
    stopRotation = false;
    requestAnimationFrame(render);
});
const stopButton = document.getElementById('stopButton');
stopButton.addEventListener('click', () => {
    stopRotation = true;
});

// * Handle mouse event
let selectedIndex = null;
const rect = canvas.getBoundingClientRect();

canvas.addEventListener("mousedown", e => {    
    // Get the mouse position relative to top left of web view
    let x = e.clientX;
    let y = e.clientY;
    
    const valNormalize = getRelativePosition(x, y, rect);
    
    const proportionToCanvasSize = 15 / rect.width;
    
    // Iterate through vertexs to find the vertex in particular distances range
    for (var i = 0; i < vertices.length; i += 2) {
        if (Math.abs(vertices[i] - valNormalize[0]) < proportionToCanvasSize && Math.abs(vertices[i + 1] - valNormalize[1]) < proportionToCanvasSize) {
            selectedIndex = i;
            break;
        }
    }
});

canvas.addEventListener("mousemove", e => {
    if (selectedIndex !== null) {        
        // Get the mouse position relative to top left of web view
        let x = e.clientX;
        let y = e.clientY;
        
        // Get the dynamic position that then normalized
        const valNormalize = getRelativePosition(x, y, rect);
        vertices[selectedIndex] = valNormalize[0];
        vertices[selectedIndex + 1] = valNormalize[1];
        
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        
        // Redraw the line
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
});

canvas.addEventListener("mouseup", e => {
    selectedIndex = null;
});

// * Handle slider event
const sliderTranslasiX = document.querySelector("#translasi-x-slider");
const sliderTranslasiY = document.querySelector("#translasi-y-slider");
const sliderRotasi = document.querySelector("#rotasi-slider");

sliderTranslasiX.addEventListener("input", e => {
    const shiftVal = sliderTranslasiX.value - vertices[0];
    vertices.forEach((val, idx) => {
        if(idx % 2 === 0) {
            vertices[idx] += shiftVal;
        }
    })

    drawLine(vertices, vertexBuffer)
})

sliderTranslasiY.addEventListener("input", e => {
    const shiftVal = sliderTranslasiY.value - vertices[1];
    vertices.forEach((val, idx) => {
        if(idx % 2 === 1) {
            vertices[idx] += shiftVal;
        }
    })

    drawLine(vertices, vertexBuffer)
})

sliderRotasi.addEventListener("input", e => {
    const deg = sliderRotasi.value;
    console.info(deg);
    const rotatedSquare = rotateSquare(vertices[0], vertices[1], vertices[2], vertices[3], vertices[4], vertices[5], vertices[6], vertices[7], deg);
    console.info(rotatedSquare);
    vertices[0] = rotatedSquare[0]
    vertices[1] = rotatedSquare[1]
    vertices[2] = rotatedSquare[2]
    vertices[3] = rotatedSquare[3]
    vertices[4] = rotatedSquare[4]
    vertices[5] = rotatedSquare[5]
    vertices[6] = rotatedSquare[6]
    vertices[7] = rotatedSquare[7]
    
    drawLine(vertices, vertexBuffer)
})
// * Handle onload window

window.addEventListener("load", e => {
    sliderTranslasiX.value = vertices[0];
    sliderTranslasiY.value = vertices[1];
    sliderRotasi.value = vertices[2];
});

const drawLine = (vertices, vertexBuffer) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    // Redraw the line
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

// handle create rectangle
const rectangleLoader = document.querySelector("#loader");
rectangleLoader.addEventListener("click", (e) => {
    // Draw the square
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
});