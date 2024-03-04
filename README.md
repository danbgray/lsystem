# L-System Renderer

This project is a WebGL-based renderer for L-Systems (Lindenmayer Systems), a mathematical formalism proposed by Aristid Lindenmayer in 1968 as a foundation for an algorithmic description of plant growth processes. L-Systems are widely used in computer graphics to generate fractal-like structures and model the growth of plants and other organisms.

![screenshot](https://github.com/danbgray/lsystem/blob/main/screenshot.jpg?raw=true)

## Live Version
https://danbgray.github.io/lsystem/

## What is an L-System?

An L-System consists of an alphabet of symbols that can be used to make strings, a collection of production rules that expand each symbol into a larger string of symbols, an initial "axiom" string from which to begin construction, and a mechanism for translating the generated strings into geometric structures.

L-Systems are particularly famous for their ability to model complex shapes in nature with a few simple rules applied iteratively.

## Features

- **Shader-Based Rendering:** Utilizes WebGL for efficient, GPU-accelerated rendering of L-System fractals.
- **Dynamic Shader Editing:** Edit vertex and fragment shaders directly in the browser for real-time visual feedback.
- **Preset Management:** Comes with preset shaders for quick experimentation and also allows for the addition of custom shaders.
- **Interactive Controls:** Adjust parameters such as recursion depth, angle, and drawing length to explore variations of the generated fractal patterns.

## Getting Started

1. Clone the repository:
    
    bashCopy code
    
    `git clone https://github.com/yourusername/lsystem-renderer.git`
    
2. Open `index.html` in a modern web browser with WebGL support.
    
3. Select a preset or input your own rules to start generating L-System fractals.
    

## Customizing Shaders

Shaders can be edited in real-time via the provided text areas. Vertex and fragment shaders are supported, allowing for complex visual effects and colorations of the rendered L-Systems.

## Additional References

- The Algorithmic Beauty of Plants by Przemyslaw Prusinkiewicz and Aristid Lindenmayer: The seminal book on using L-Systems for modeling plant growth.
- L-Systems - Wikipedia: A comprehensive overview of the theory and application of L-Systems.
- WebGL - MDN Web Docs: Documentation and tutorials on WebGL, which is used in this project for rendering.

## Contributing

Contributions to this project are welcome! Whether it's adding new presets, improving the shader editor, or fixing bugs, feel free to fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Thanks to all the contributors who have helped to improve this project.
- Special thanks to Daniel Gray for initiating this project and providing guidance. (Twitter: [@dbgray](https://twitter.com/dbgray)

Please feel free to reach out or DM me.  Its free to use for whatever you want to use it for, but please credit me if you do.



