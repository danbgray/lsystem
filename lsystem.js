/*!
 * ----------------------------------------------------------------------------
 * L-System Block Render
 * ----------------------------------------------------------------------------
 * Copyright (C) 2024 Daniel Gray
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT Public License
 * I do ask that if you copy it, you credit me (twitter @dbgray)
 * and if you profit from it, you consider chipping in.
 * ----------------------------------------------------------------------------
 */


// Global reference to the shader program
let currentShaderProgram = null;

// Global bounds to record the size of our drawing if we want to re-center.
let globalBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

// Vertex shader program and WebGL initialization code
let vsSource = `
attribute vec4 aVertexPosition;
attribute float aDepth;
attribute float aAxiom; // New attribute for axiom

varying float vDepth;
varying float vAxiom; // Pass axiom to fragment shader

void main(void) {
    gl_Position = aVertexPosition;
    vDepth = aDepth;
    vAxiom = aAxiom;
}

`;

// Fragment shader program
let fsSource = `
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
}


`;
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    currentShaderProgram = gl.createProgram();
    gl.attachShader(currentShaderProgram, vertexShader);
    gl.attachShader(currentShaderProgram, fragmentShader);
    gl.linkProgram(currentShaderProgram);

    // Check if the shader program was successfully linked
    if (!gl.getProgramParameter(currentShaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(currentShaderProgram));
        return null;
    }
    return currentShaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check if the shader was successfully compiled
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null; // Return null to indicate failure
    }

    return shader; // Return the compiled shader
}

function initWebGL(canvas) {
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return null;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource); // Assume this function is correctly implemented
    gl.useProgram(shaderProgram);

    // Adjust canvas size to match display size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {gl, shaderProgram};
}


/* Not currently used, but it creates a guide of the outermost bounds of the lsystem */
function updateGlobalBounds(x, y) {
    globalBounds.minX = Math.min(globalBounds.minX, x);
    globalBounds.maxX = Math.max(globalBounds.maxX, x);
    globalBounds.minY = Math.min(globalBounds.minY, y);
    globalBounds.maxY = Math.max(globalBounds.maxY, y);
}

/* Core Functions */
function drawLSystem(gl, shaderProgram, instructions, angle, centerX, centerY, length, initialThickness) {
    let dir = Math.PI / 2; // Start direction (upwards)
    const rad = (a) => a * (Math.PI / 180); // Convert degrees to radians for rotation
    const stack = [];
    let vertices = [];
    let depthAttributes = []; // For color variation based on 'depth'
    let axiomAttributes = []; // New array for axiom attributes for use with the shaders.

    let depth = 0; // Initial depth

    let x = centerX, y = centerY; // Starting position
    instructions.split('').forEach(cmd => {
        if (cmd.match(/[A-Z]/)) { // Move forward and draw for uppercase letters
            let newX = x + Math.cos(dir) * length;
            let newY = y + Math.sin(dir) * length;

            // Add vertices for line
            vertices.push(x, y, newX, newY);
            depthAttributes.push(depth, depth); // Assuming color/depth is applied per vertex
            depth += 1;
             let axiomIndex = cmd.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
             axiomAttributes.push(axiomIndex, axiomIndex); // For start and end of the line

            x = newX; // Update current position
            y = newY;
        } else if (cmd.match(/[a-z]/)) { // Move forward without drawing for lowercase letters
            x += Math.cos(dir) * length; // Update current position
            y += Math.sin(dir) * length;
        } else {
            switch(cmd) {
                case '+': // Turn right
                    dir += rad(angle);
                    break;
                case '-': // Turn left
                    dir -= rad(angle);
                    break;
                case '[': // Save state
                    stack.push({x, y, dir, depth});
                    depth++; // Increment depth
                    break;
                case ']': // Restore state
                    ({x, y, dir, depth} = stack.pop());
                    break;
            }
        }
    });

    // Call drawLines to draw the computed vertices
    if(vertices.length > 0) {
        drawLines(gl, shaderProgram, vertices, depthAttributes, axiomAttributes);
    }
}


function drawLines(gl, shaderProgram, vertices, depthAttributes, axiomAttributes) {
    // Vertex buffer setup
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Vertex position attribute setup
    const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);

    // Depth (color variation) buffer setup
    const depthBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, depthBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(depthAttributes), gl.STATIC_DRAW);

    // Depth attribute setup
    const depthAttribLocation = gl.getAttribLocation(shaderProgram, 'aDepth');
    gl.vertexAttribPointer(depthAttribLocation, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(depthAttribLocation);

    // Axiom attribute setup
    const axiomBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, axiomBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axiomAttributes), gl.STATIC_DRAW);

    // Axiom attribute setup
    const axiomAttribLocation = gl.getAttribLocation(shaderProgram, 'aAxiom');
    gl.vertexAttribPointer(axiomAttribLocation, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(axiomAttribLocation);

    // Use the shader program
    gl.useProgram(shaderProgram);

    // Draw the lines
    gl.drawArrays(gl.LINES, 0, vertices.length / 2); // Adjust based on your geometry

    // Cleanup
    gl.disableVertexAttribArray(positionAttribLocation);
    gl.disableVertexAttribArray(depthAttribLocation);
    gl.disableVertexAttribArray(axiomAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}



/* Takes in rules and axioms and generates a much longer string of directions for drawing the system */
function generateLSystem(rules, axiom, depth) {
    let result = axiom;
    for (let i = 0; i < depth; i++) {
        let newResult = '';
        for (const char of result) {
            newResult += rules[char] || char;
        }
        result = newResult;
    }
    return result;
}



/* On Desktop, show prompt.  This is currently not used, but we want to be able to show the user some prompt.
   to encourage interaction. */

// Mouse down event to start drag

// Bind the "Scale to Fit" button click event
/* Mobile Support Functions */
/* Mobile Support */
function setupSensors() {
        // Check for DeviceOrientationEvent support and request permission on iOS 13+
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation, false);
                    } else {
                        console.error('Device Orientation permission not granted.');
                        // Implement fallback or inform the user as needed
                    }
                })
                .catch(console.error);
        } else {
            // Directly add event listeners for devices not requiring permission (including Android)
            window.addEventListener('deviceorientation', handleOrientation, false);
        }

        // Add devicemotion listener for all devices
        window.addEventListener('devicemotion', handleMotion, false);
}

function handleOrientation(event) {
    const beta = event.beta*1.5; // Left / Right tilt.
    let normalizedAngle = beta + 180;
    document.getElementById('angle').value = normalizedAngle.toFixed(2);
}

function handleMotion(event) {
    // Placeholder for motion handling logic
    console.log(event);
}


function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/* Adjust mobile controls */
function adjustLayoutForMobile() {
  if (isMobileDevice()) {
      // Hide controls panel
      document.getElementById('controls').style.display = 'none';

      // Make canvas full screen
      const canvas = document.getElementById('glcanvas');
      canvas.style.width = '100%';
      canvas.style.height = '100vh'; // Use 100% of the viewport height
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }
}
// Utility function to compile a shader
function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Function to initialize and update the shader program
function initOrUpdateShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function updateShaderProgram(gl) {
  const vsSource = document.getElementById('vertexShaderCode').value.trim();
  const fsSource = document.getElementById('fragmentShaderCode').value.trim();
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource); // Assume this function is correctly implemented
  gl.useProgram(shaderProgram);
  console.log("Shader program updated successfully.");
  return gl;
}

/* Data Loading */
function getUrlParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const params = {};
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    return params;
}
function prePopulateFields() {
    const params = getUrlParams();

    // Check if the parameters exist and set the form field values
    if (params['angle']) {
        document.getElementById('angle').value = params['angle'];
    }
    if (params['depth']) {
        document.getElementById('depth').value = params['depth'];
    }
    if (params['axiom']) {
        document.getElementById('axiom').value = params['axiom'];
    }
    if (params['rules']) {
        document.getElementById('rule').value = params['rules'];
    }
    if (params['centerX']) {
        document.getElementById('centerX').value = params['centerX'];
    }
    if (params['centerY']) {
        document.getElementById('centerY').value = params['centerY'];
    }
    if (params['length']) {
        document.getElementById('length').value = params['length'];
    }

    // Preload vertex shader code
     if (params['vShader']) {
         const vertexShaderCode = atob(params['vShader']); // Decode Base64
         document.getElementById('vertexShaderCode').value = vertexShaderCode;
     }

     // Preload fragment shader code
     if (params['fShader']) {
         const fragmentShaderCode = atob(params['fShader']); // Decode Base64
         document.getElementById('fragmentShaderCode').value = fragmentShaderCode;
     }

}


// Global variables for angle and mouse position
let angle = 25; // Default angle
let mouseX = 0; // Mouse X position
let drag = false;

function setupListeners(canvas) {
  const dragMessage = document.getElementById('dragMessage'); // The message element
  /* Sets up event listeners, depends on having the canvas context already setup
     since the listeners will have an affect on the canvas, esp Shaders ( when complete ) */
  document.getElementById('updateShader').addEventListener('click', function() {
      const gl = document.querySelector('#glcanvas').getContext('webgl');
       if (!gl) {
           console.error("WebGL context not available.");
           return;
       }
       updateShaderProgram(gl); // Pass the WebGL context
  });


  document.getElementById('toggleShaderCode').addEventListener('click', function() {
      const shaderCodeContent = document.getElementById('shaderCodeContent');
      if (shaderCodeContent.style.display === "none") {
          shaderCodeContent.style.display = "block";
          this.textContent = "Hide Shader Code";
      } else {
          shaderCodeContent.style.display = "none";
          this.textContent = "Show Shader Code";
      }
  });

  // Setup mouse move event listener to update the angle based on mouse position
  canvas.addEventListener('mousedown', (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left; // Update global mouseX
      const canvasWidth = canvas.clientWidth;
      angle = ((mouseX-canvasWidth/2) / canvasWidth) * 90; // Map mouse X to a 0-90 degree angle
      document.getElementById('angle').value = angle;
      if(mouseX > canvasWidth) { drag = false; }
      if(drag === false) {
          drag = true;
          dragMessage.style.display = 'none';
      } else { drag = false; dragMessage.style.display = 'block';}
  });

  // Mobile sup
  canvas.addEventListener('mousemove', (event) => {
    if (drag) {
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left; // Update global mouseX
      const canvasWidth = canvas.clientWidth;
      angle = ((mouseX-canvasWidth/2) / canvasWidth) * 90; // Map mouse X to a 0-90 degree angle
      document.getElementById('angle').value = angle;
    }
  });
  canvas.addEventListener('mouseleave', function(event) {
    if (drag) {
      drag = false; // Reset drag state
      dragMessage.style.display = 'none'; // Hide message
    }
  });
}

function main() {
    adjustLayoutForMobile(); // Adjust layout based on the device type
    prePopulateFields();
    const canvas = document.getElementById('glcanvas');
    // Set canvas dimensions to 70% of window width and 100% of window height
    canvas.width = window.innerWidth * (isMobileDevice() ? 1 : 0.7); // Adjust size based on device type
    canvas.height = window.innerHeight;
    var drag = false;
    var dragStart;
    var dragEnd;


    // Ensure the CSS styling matches (optional, for consistency)
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    const {gl, shaderProgram} = initWebGL(canvas);
    if (!gl) {
        return;
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    /* Motion and realtime event listeners */
    setupSensors();


    /* Desktop Support */

    /* Setup Event Listeners */
    setupListeners(canvas);

    function parseRules(el) {
      /* Takes in a string and returns a rule dict */
      rulesInput = el.split("\n");
      rules = {};
      rulesInput.forEach(rule => {
          let parts = rule.split('=');
          if (parts.length === 2) {
              rules[parts[0].trim()] = parts[1].trim();
          }
      });
      return rules;
    }
    // Facilitate a default 'F=' rule if non

    rules = parseRules(document.getElementById('rule').value);
    // L-system setup
    const recursionDepth = 5; // Adjust as needed


    /* Sharing methods */
    function getCanvasDataURL() {  /* For taking a snapshot and saving as an image */
        const canvas = document.getElementById('glcanvas');
        return canvas.toDataURL('image/png');
    }
    function createTweetLink(text, url) {
      const tweetText = encodeURIComponent(text);
      const tweetUrl = encodeURIComponent(url);
      return `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    }
    function generateLink() {
          // Retrieve values from the inputs
        const angle = document.getElementById('angle').value;
        const depth = document.getElementById('depth').value;
        const axiom = document.getElementById('axiom').value;
        const rule = document.getElementById('rule').value;
        const length = parseFloat(document.getElementById('length').value);
        const centerX = parseFloat(document.getElementById('centerX').value);
        const centerY = parseFloat(document.getElementById('centerY').value);



        // Encode the rule parameter to ensure the URL is valid
        const encodedRule = encodeURIComponent(rule);
        const encodedAxiom = encodeURIComponent(axiom);

        // Construct the URL with GET parameters
        const baseUrl = window.location.href.split('?')[0]; // Removes existing parameters if any
        const newUrl = `${baseUrl}?centerX=${centerX}&centerY=${centerY}&angle=${angle}&depth=${depth}&axiom=${encodedAxiom}&rules=${encodedRule}&length=${length}`;

        return newUrl;
    }
    document.getElementById('tweet').addEventListener('click', () => {
      // Example text and URL
      const text = "Check out my L-system!";
      // Assume `generateLink` is a function that generates a URL to your app with the current L-system parameters
      const url = generateLink(); // Implement this based on your app's logic

      // Generate the tweet link (omitting the direct image embedding)
      const tweetLink = createTweetLink(text, url);

      // Open the tweet link in a new tab/window
      window.open(tweetLink, '_blank');
    });

    document.getElementById('update').addEventListener('click', () => {

        // Redirect the user to the new URL
        window.location.href = generateLink();
    });

    function animate() {
        requestAnimationFrame(animate); // Continue the animation loop
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the canvas

        const axiom = document.getElementById('axiom').value;
        const ruleStr = document.getElementById('rule').value;
        const depth = parseInt(document.getElementById('depth').value);
        const length = parseFloat(document.getElementById('length').value);
        const angle = parseFloat(document.getElementById('angle').value);
        const centerX = parseFloat(document.getElementById('centerX').value);
        const centerY = parseFloat(document.getElementById('centerY').value);
        // Generate the L-system string with the current angle

        // Calculate Rules from Input
        // Assuming the axiom format is "F=" and we're only using the first character
        const predecessor = axiom.charAt(0); // Get the first character of the axiom input

        // Create the rules object using the predecessor and the rule string
        const rules = parseRules(ruleStr);
        const instructions = generateLSystem(rules, axiom, depth);
        // Draw the L-system


        drawLSystem(gl, currentShaderProgram, instructions, angle, centerX, centerY, length);
    }

    animate(); // Start the animation loop
}

window.onload = main;


window.addEventListener('resize', () => {
  location.reload();
  /*
    const canvas = document.getElementById('glcanvas');
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight;

    // Ensure the CSS styling matches (optional, for consistency)
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);

    */
    // You might need to call a function to redraw your scene here
});
