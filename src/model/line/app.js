import { vertexShaderGLSL, fragmentShaderGLSL, vertexShaderGLSL2,fragmentShaderGLSL2 } from "../../modules/shader.js";
import { createShader, createProgram } from "../../modules/generator.js";
import { getRelativePosition, rotatePoints, hexToRGB } from "../../modules/transform-utils.js";

// * Setting up a WebGL context
const canvas = document.querySelector("#draw-surface");
const gl = canvas.getContext("webgl");

// * Creating, loading and compiling shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderGLSL2); // ! New
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderGLSL2); // ! New

const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
// const colorUniformLocation = gl.getUniformLocation(program, "u_color");
const colorAttributeLocation = gl.getAttribLocation(program, "a_color");

// * Create buffer and upload data

// ** Position buffer
// let positions = [];
let positions = [];
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);


// ** Color buffer
let colors = [];
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

gl.enableVertexAttribArray(colorAttributeLocation);
gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

// ** Set up
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program); // Execute shader program

// * Handle mouse event
let selectedIndex = null;
const rect = canvas.getBoundingClientRect();

canvas.addEventListener("mousedown", e => {    
    // Get the mouse position relative to top left of web view
    const pickedInfo = document.querySelector("#picked-info");
    selectedIndex = picker(e);
    pickedObject = picker(e);
    if(pickedObject != null) {
        sliderTranslasiX.value = positions[pickedObject];
        sliderTranslasiY.value = positions[pickedObject + 1];

        sliderTranslasiX.removeAttribute('disabled');
        sliderTranslasiY.removeAttribute('disabled');
        sliderRotasi.removeAttribute('disabled');
        colorPicker.removeAttribute('disabled');

        pickedInfo.removeAttribute('hidden');
        pickedInfo.innerHTML = `Selected: vertex with index ${pickedObject}` 
    } else {
        pickedInfo.setAttribute("hidden", true);
        sliderTranslasiX.setAttribute('disabled', true);
        sliderTranslasiY.setAttribute('disabled', true);
        sliderRotasi.setAttribute('disabled', true);
        colorPicker.setAttribute('disabled', true);
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
        sliderTranslasiX.value = valNormalize[0];
        sliderTranslasiY.value = valNormalize[1];
        
        drawLine(positions, positionBuffer, colors, colorBuffer);
    }
});

canvas.addEventListener("mouseup", e => {
    selectedIndex = null;
});

// * Handle slider event
let pickedObject = null;
const sliderTranslasiX = document.querySelector("#translasi-x-slider");
const sliderTranslasiY = document.querySelector("#translasi-y-slider");
const sliderRotasi = document.querySelector("#rotasi-slider");
const colorPicker = document.querySelector("#color-picker");
const lineLoader = document.querySelector("#line-loader");

lineLoader.addEventListener("click", e => {
    positions.push(
        -0.25, 0,
        0.25, 0,
    )
    colors.push(
        0, 0, 0, 1,
        0, 0, 0, 1,
    )
    drawLine(positions, positionBuffer, colors, colorBuffer);
})

sliderTranslasiX.addEventListener("input", e => {
    const shiftVal = sliderTranslasiX.value - positions[pickedObject];
    positions[pickedObject] += shiftVal;
    if(pickedObject != null) {
        if(pickedObject % 4 == 0) {
            positions[pickedObject + 2] += shiftVal;
        } else if((pickedObject - 2) % 4 == 0) {
            positions[pickedObject - 2] += shiftVal;
        }
    }
    drawLine(positions, positionBuffer, colors, colorBuffer);
})

sliderTranslasiY.addEventListener("input", e => {
    const shiftVal = sliderTranslasiY.value - positions[1];
    positions[pickedObject + 1] += shiftVal;
    if(pickedObject != null) {
        if((pickedObject) % 4 == 0) {
            positions[pickedObject + 3] += shiftVal;
        } else if((pickedObject - 2) % 4 == 0) {
            positions[pickedObject - 1] += shiftVal;
        }
    }
    drawLine(positions, positionBuffer, colors, colorBuffer);
})

sliderRotasi.addEventListener("input", e => {
    const deg = sliderRotasi.value;
    let rotatedPoints = null;
    // 0 [1] 2 3 || 4 [5] 6 7 || 8 [9] 10 11 || 12 13 14 15
    if(pickedObject != null) {
        if(pickedObject % 4 == 0) {
            rotatedPoints = rotatePoints(positions[pickedObject], positions[pickedObject + 1], positions[pickedObject + 2], positions[pickedObject + 3], deg);             
        } else if((pickedObject - 2) % 4 == 0) {
            rotatedPoints = rotatePoints(positions[pickedObject], positions[pickedObject + 1], positions[pickedObject - 2], positions[pickedObject - 1], deg);
        }
    }
    positions[pickedObject] = rotatedPoints[0];
    positions[pickedObject + 1] = rotatedPoints[1];
    
    drawLine(positions, positionBuffer, colors, colorBuffer);
})

colorPicker.addEventListener("change", e=> {
    // console.info(colorPicker.value);
    const rgbVal = hexToRGB(colorPicker.value);
    console.info(rgbVal.r);
    if(pickedObject != null) {
        colors[pickedObject * 2] = rgbVal.r / 255
        colors[pickedObject * 2 + 1] = rgbVal.g / 255
        colors[pickedObject * 2 + 2] = rgbVal.b / 255
    }

    drawLine(positions, positionBuffer, colors, colorBuffer);
})

// * Handle onload window

window.addEventListener("load", e => {
    sliderTranslasiX.value = 0;
    sliderTranslasiY.value = 0;
    sliderRotasi.value = 0;
});

const drawLine = (positions, positionBuffer, colors, colorBuffer) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

    // Redraw the line
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, positions.length / 2);
}

const picker = (e) => {
    let x = e.clientX;
    let y = e.clientY;
    
    const valNormalize = getRelativePosition(x, y, rect);
    
    const proportionToCanvasSize = 15 / rect.width;
    
    // Iterate through vertexs to find the vertex in particular distances range
    for (var i = 0; i < positions.length; i += 2) {
        if (Math.abs(positions[i] - valNormalize[0]) < proportionToCanvasSize && Math.abs(positions[i + 1] - valNormalize[1]) < proportionToCanvasSize) {
            return i;
        }
    }
}

// 0 1 || 2 3 || 4 5 || 6 7 ||
// 0 1 2 3 || 4 5 6 7 || 8 9 10 11 ||