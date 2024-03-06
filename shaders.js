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
          attribute float aDepth; // Depth will influence color in the fragment shader.

          varying float vDepth;

          void main(void) {
            gl_Position = aVertexPosition;
            vDepth = aDepth; // Pass depth through to the fragment shader.
          }`,
        fShader: `
        precision mediump float;

varying float vDepth; // Received from the vertex shader, integer values starting at 1.

void main(void) {
    vec3 color;

    // Define transition ranges based on integer depth values
    const float stemEndDepth = 50.0; // Depth at which the stem ends and leaves start

    // Colors for the stem and leaves
    vec3 brown = vec3(0.65, 0.16, 0.16); // Stem color
    vec3 green = vec3(0.0, 0.8, 0.0); // Leaves color

    if (vDepth <= stemEndDepth) {
        // Use brown color for the stem
        color = brown;
    } else {
        // Use green color for leaves beyond the stem
        color = green;
    }

    // Optional: Randomly introduce flower-like colors in the upper parts of the plant
    if (vDepth > stemEndDepth && fract(sin(vDepth) * 43758.5453) > 0.9) {
        // Mix in some pink/purple colors randomly for "flowers"
        vec3 flowerColor = mix(vec3(0.94, 0.5, 0.5), vec3(0.5, 0.0, 0.5), fract(sin(vDepth) * 0.9));
        color = mix(color, flowerColor, 0.8); // Softly blend the flower color with green
    }

    gl_FragColor = vec4(color, 1.0); // Apply the calculated color
}

`
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

    // Function to convert HSV to RGB
    vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main(void) {
        // Define base hues for different clusters
        float baseHueOrange = 0.08; // Orange
        float baseHueRed = 0.0; // Red
        float baseHuePink = 0.85; // Pink
        float baseHueBlue = 0.55; // Blue

        // Determine the cluster based on depth
        float cluster = mod(floor(vDepth / 5.0), 4.0); // Smaller cluster size for more frequent color changes

        // Select base hue based on cluster
        float hue = baseHueRed; // Default to red
        if (cluster == 0.0) hue = baseHueOrange;
        else if (cluster == 1.0) hue = baseHueRed;
        else if (cluster == 2.0) hue = baseHuePink;
        else if (cluster == 3.0) hue = baseHueBlue;

        // Oscillate brightness within each cluster
        float brightness = 0.8 + 0.2 * sin(vDepth * 0.1); // Brighter overall, with subtler oscillation

        vec3 color = hsv2rgb(vec3(hue, 1.0, brightness)); // Full saturation, controlled brightness oscillation

        gl_FragColor = vec4(color, 1.0);
    }`},
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
