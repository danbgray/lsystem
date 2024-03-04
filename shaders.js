// shaders.js
const shaderLibrary = {
    "Basic": {
        vShader: `attribute vec4 aVertexPosition;
        attribute float aDepth;
        attribute float aAxiom; // New attribute for axiom

        varying float vDepth;
        varying float vAxiom; // Pass axiom to fragment shader

        void main(void) {
            gl_Position = aVertexPosition;
            vDepth = aDepth;
            vAxiom = aAxiom;
        }`,
        fShader: `precision mediump float;

        varying float vDepth;
        varying float vAxiom;

        void main(void) {
            // Enhanced base color variation affected by axiom
            // Cycle through colors more broadly
            vec3 baseColor = vec3(sin(vAxiom * 0.2 + 1.0) * 0.5 + 0.5,
                                  cos(vAxiom * 0.2 + 2.0) * 0.5 + 0.5,
                                  sin(vAxiom * 0.2 + 3.0) * 0.5 + 0.5);

            // Adjust color brightness based on depth to ensure visibility
            // Use a non-linear transformation to avoid colors becoming too bright or too dark
            float brightnessFactor = clamp((cos(vDepth / 100. - 1.0) + 1.0) * 0.5, 0.3, 0.9);

            vec3 color = baseColor * brightnessFactor;

            gl_FragColor = vec4(color, 1.0);
        }
`
    },
    "Colorful": {
        vShader: ``,
        fShader: `// Fragment Shader Code for Colorful Effect`
    },
    // Add more shaders as needed
};
