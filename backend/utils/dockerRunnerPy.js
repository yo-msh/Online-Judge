const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const runUserCodePy = (code, input) => {
  return new Promise((resolve, reject) => {
    // Define paths for temporary files
    const uniqueId = Date.now();
    const codePath = path.join(__dirname, `temp_code_${uniqueId}.py`);
    const inputPath = path.join(__dirname, `temp_input_${uniqueId}.txt`);
    // Write the user code and input to temporary files
    fs.writeFileSync(codePath, code);
    fs.writeFileSync(inputPath, input || ""); // Handle optional input

    // Build the Docker command
    const dockerCommand = `docker run --rm -v ${codePath}:/app/code.py -v ${inputPath}:/app/input.txt sandbox-python:v1`;

    // Execute the Docker command
    exec(dockerCommand,{timeout: 5000}, (error, stdout, stderr) => {

      // Handle timeout errors
      if (error && error.signal === "SIGTERM") {
        return reject("Execution timed out.");
      }
      // Clean up temporary files
      fs.unlinkSync(codePath);
      fs.unlinkSync(inputPath);

      if (error) {
        // Return errors if any
        return reject(stderr || error.message);
      }
      // Return the standard output
      resolve(stdout.trim());
    });
  });
};

module.exports = { runUserCodePy };







// const { exec } = require('child_process');
// const os = require('os');
// const path = require('path');
// const fs = require('fs')

// const runUserCode = async (code, input) => {
//     return new Promise((resolve, reject) => {
//         const tmpDir = os.tmpdir(); // Cross-platform temporary directory
//         const codePath = path.join(tmpDir, 'code.py');
//         const inputPath = path.join(tmpDir, 'input.txt');
//         // const outputPath = '/tmp/output.txt'; // Temporary file for execution output
//         const outputPath = path.join(tmpDir, 'output.txt');

//         // Write the user code and input to temporary files
//         fs.writeFileSync(codePath, code);
//     fs.writeFileSync(inputPath, input);

//         // Run the Docker container
//         const dockerCommand = `docker run --rm -v ${codePath}:/app/code.py -v ${inputPath}:/app/input.txt sandbox-python:v1`;

//         exec(dockerCommand, (error, stdout, stderr) => {
//             if (error) {
//                 return reject(stderr || error.message);
//             }

//             // Read and return the output
//             const output = fs.readFileSync(outputPath, 'utf-8');
//             resolve(output.trim());
//         });
//     });
// };

// module.exports = { runUserCode };
