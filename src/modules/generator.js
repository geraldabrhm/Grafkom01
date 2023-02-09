export const createShader = (gl, type, glslSrc) => {
    const newShader = gl.createShader(type);
    gl.shaderSource(newShader, glslSrc);
    gl.compileShader(newShader);

    const isCompiled = gl.getShaderParameter(newShader, gl.COMPILE_STATUS);
    if(isCompiled) {
        return newShader;
    }

    const msg = gl.getShaderInfoLog(newShader)
    if(msg.length > 0) {
        throw msg;
    }
}

export const createProgram = (gl, vertexShader, fragmentShader) => {
    const newProgram = gl.createProgram();
    gl.attachShader(newProgram, vertexShader);
    gl.attachShader(newProgram, fragmentShader);
    gl.linkProgram(newProgram);

    const isLinked = gl.getProgramParameter(newProgram, gl.LINK_STATUS);
    if(isLinked) {
        return newProgram;
    }

    const msg = gl.getProgramInfoLog(newProgram)
    if(msg.length > 0) {
        throw msg;
    }
}