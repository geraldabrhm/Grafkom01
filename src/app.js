import { vertexShaderGLSL, fragmentShaderGLSL } from "./modules/shader.js";
import { createShader, createProgram } from "./modules/generator.js";
import { getRelativePosition, rotatePoints } from "./modules/transform-utils.js";

// * Setting up a WebGL context
const canvas = document.querySelector("#draw-surface");
const gl = canvas.getContext("webgl")

// * Creating, loading and compiling shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderGLSL);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderGLSL);

const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const colorUniformLocation = gl.getUniformLocation(program, "u_color");

// * Create buffer and upload data
let positions = [
    0, 0.5,
    0.7, 0,
];

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// * Drawing the initial line
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program); // Execute shader program

gl.enableVertexAttribArray(positionAttributeLocation)
gl.uniform4f(colorUniformLocation, 0.5, 0.7, 0.5, 1)

gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

gl.drawArrays(gl.LINES, 0, positions.length / 2);

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
    for (var i = 0; i < positions.length; i += 2) {
        if (Math.abs(positions[i] - valNormalize[0]) < proportionToCanvasSize && Math.abs(positions[i + 1] - valNormalize[1]) < proportionToCanvasSize) {
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
        positions[selectedIndex] = valNormalize[0];
        positions[selectedIndex + 1] = valNormalize[1];
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Redraw the line
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.LINES, 0, positions.length / 2);
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
    const shiftVal = sliderTranslasiX.value - positions[0];
    positions.forEach((val, idx) => {
        if(idx % 2 === 0) {
            positions[idx] += shiftVal;
        }
    })

    drawLine(positions, positionBuffer)
})

sliderTranslasiY.addEventListener("input", e => {
    const shiftVal = sliderTranslasiY.value - positions[1];
    positions.forEach((val, idx) => {
        if(idx % 2 === 1) {
            positions[idx] += shiftVal;
        }
    })

    drawLine(positions, positionBuffer)
})

sliderRotasi.addEventListener("input", e => {
    const deg = sliderRotasi.value;
    console.info(deg);
    const rotatedPoints = rotatePoints(positions[2], positions[3], positions[0], positions[1], deg);
    console.info(rotatedPoints);
    positions[2] = rotatedPoints[0]
    positions[3] = rotatedPoints[1]
    
    drawLine(positions, positionBuffer)
})
// * Handle onload window

window.addEventListener("load", e => {
    sliderTranslasiX.value = positions[0];
    sliderTranslasiY.value = positions[1];
    sliderRotasi.value = 0
});

const drawLine = (positions, positionBuffer) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    // Redraw the line
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, positions.length / 2);
}