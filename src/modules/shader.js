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

export { vertexShaderGLSL, fragmentShaderGLSL };