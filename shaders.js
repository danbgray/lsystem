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
