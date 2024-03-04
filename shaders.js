// shaders.js
const shaderLibrary = {
    "Basic": {
      vShader: `
      attribute vec4 aVertexPosition;
      attribute float aDepth;
      attribute float aAxiom; // New attribute for axiom

      varying float vDepth;
      varying float vAxiom; // Pass axiom to fragment shader

      void main(void) {
          gl_Position = aVertexPosition;
          vDepth = aDepth;
          vAxiom = aAxiom;
      }`,
      fShader: `
      precision mediump float;

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
      }`
    },
    "Plant": {
        vShader: `
        attribute vec4 aVertexPosition;
        attribute float aDepth;
        varying float vDepth;
        void main(void) {
            gl_Position = aVertexPosition;
            vDepth = aDepth;
        }`,
        fShader: `
        precision mediump float;
        varying float vDepth;
        void main(void) {
            vec3 color;
            if (vDepth < 0.2) { // Assume the first 20% of depth is the trunk
                color = vec3(0.55, 0.27, 0.07); // Brown
            } else if (vDepth < 0.8) { // Middle segments for leaves
                float greenIntensity = 0.5 + 0.5 * sin(vDepth * 3.1415); // Oscillate green intensity
                color = vec3(0.0, greenIntensity, 0.0); // Green shades
            } else { // Last segments for flowers
                // Interpolate between pink and purple towards the tips
                float mixRatio = (vDepth - 0.8) / 0.2; // Normalize between 0 and 1
                vec3 pink = vec3(0.9, 0.58, 0.8);
                vec3 purple = vec3(0.5, 0.0, 0.5);
                color = mix(pink, purple, mixRatio);
            }
            gl_FragColor = vec4(color, 1.0);
        }`
    },
    "Coral": {
        vShader: `
        attribute vec4 aVertexPosition;
        attribute float aDepth;

        varying float vDepth;

        void main(void) {
            gl_Position = aVertexPosition;
            vDepth = aDepth;
        }`,
        fShader: `
        precision mediump float;

        varying float vDepth;

        void main(void) {
            // Use depth to modulate color between pink and orange
            float r = 0.9 + 0.1 * cos(vDepth);
            float g = 0.2 * sin(vDepth);
            float b = 0.2;
            gl_FragColor = vec4(r, g, b, 1.0);
        }`
    },
    "StarryNight": {
        vShader: `
        attribute vec4 aVertexPosition;
        attribute float aDepth;

        varying float vDepth;

        void main(void) {
            gl_Position = aVertexPosition;
            vDepth = aDepth;
        }`,
        fShader: `
        precision mediump float;

        varying float vDepth;

        void main(void) {
            // Twinkling stars effect using depth
            float intensity = fract(sin(dot(gl_FragCoord.xy ,vec2(12.9898,78.233))) * 43758.5453);
            gl_FragColor = vec4(vec3(intensity), 1.0);
        }`
    },
    "Watercolor": {
        vShader: `
        attribute vec4 aVertexPosition;
        attribute float aDepth;

        varying float vDepth;

        void main(void) {
            gl_Position = aVertexPosition;
            vDepth = aDepth;
        }`,
        fShader: `
        precision mediump float;

        varying float vDepth;

        void main(void) {
            // Soft color transitions mimicking watercolor
            float r = 0.7 + 0.3 * cos(vDepth);
            float g = 0.7 + 0.3 * sin(vDepth);
            float b = 0.8;
            gl_FragColor = vec4(r, g, b, 0.5 + 0.5 * sin(vDepth));
        }`
    },
    "Psychedelic": {
        vShader: `
        attribute vec4 aVertexPosition;
        attribute float aDepth;

        varying float vDepth;

        void main(void) {
            gl_Position = aVertexPosition;
            vDepth = aDepth;
        }`,
        fShader: `
        precision mediump float;

        varying float vDepth;

        void main(void) {
            // Colorful, shifting patterns
            float r = sin(vDepth * 2.0 + 1.0) * 0.5 + 0.5;
            float g = cos(vDepth * 1.5 + 2.0) * 0.5 + 0.5;
            float b = sin(vDepth * 2.0 + 3.0) * 0.5 + 0.5;
            gl_FragColor = vec4(r, g, b, 1.0);
        }`
    }


    "Colorful": {
      vShader: `
          attribute vec4 aVertexPosition;
          attribute float aDepth;
          attribute float aAxiom;

          varying float vDepth;
          varying float vAxiom;

          void main(void) {
              gl_Position = aVertexPosition;
              vDepth = aDepth;
              vAxiom = aAxiom;
          }`,
      fShader: `
          precision mediump float;

          varying float vDepth;
          varying float vAxiom;

          void main(void) {
              // Generate a colorful base using both depth and axiom to modulate hue
              float hue = mod(vAxiom * 0.1 + vDepth * 0.01, 1.0);
              // Convert hue to RGB using a simple hue to RGB conversion formula for a full spectrum
              vec3 color = vec3(
                  abs(hue * 6.0 - 3.0) - 1.0,
                  2.0 - abs(hue * 6.0 - 2.0),
                  2.0 - abs(hue * 6.0 - 4.0)
              );
              color = clamp(color, 0.0, 1.0); // Ensure values are within valid range

              // Increase color saturation and brightness dynamically based on depth and axiom
              float brightness = clamp(sin(vDepth * 0.01) * 0.5 + 0.5, 0.4, 0.8);
              float saturation = clamp(cos(vAxiom * 0.1) * 0.5 + 0.5, 0.7, 1.0);

              // Adjust color using saturation and brightness
              color = mix(vec3(0.5), color, saturation) * brightness;

              gl_FragColor = vec4(color, 1.0);
          }`
    },
    // Add more shaders as needed
};
