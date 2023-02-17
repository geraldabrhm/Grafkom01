const vertexShaderGLSL = `
    attribute vec4 a_position;
        
    void main() {    
        gl_Position = a_position;
    }
`

const fragmentShaderGLSL = `
    precision mediump float;
    uniform vec4 u_color;
       
    void main() {
        gl_FragColor = u_color;
    }
`

const vertexShaderGLSL2 = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
        
    void main() {    
        gl_Position = a_position;
        v_color = a_color;
    }
`

const fragmentShaderGLSL2 = `
    precision mediump float;
    varying vec4 v_color;
       
    void main() {
        gl_FragColor = v_color;
    }
`

export { vertexShaderGLSL, fragmentShaderGLSL, vertexShaderGLSL2, fragmentShaderGLSL2 };