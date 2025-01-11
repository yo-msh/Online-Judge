const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const runUserCodeCpp = (code, input) => {
  return new Promise((resolve, reject) => {
    const uniqueId = Date.now();
    const codePath = path.join(__dirname, `temp_code_${uniqueId}.cpp`);
    const inputPath = path.join(__dirname, `temp_input_${uniqueId}.txt`);

    // Write the user code and input to temporary files
    fs.writeFileSync(codePath, code);
    fs.writeFileSync(inputPath, input || "");

    // Build the Docker command
    const dockerCommand = `docker run --rm -v ${codePath}:/app/code.cpp -v ${inputPath}:/app/input.txt sandbox-cpp:v1`;

    exec(dockerCommand, (error, stdout, stderr) => {
      fs.unlinkSync(codePath);
      fs.unlinkSync(inputPath);

      if (error) {
        return reject(stderr || error.message);
      }
      resolve(stdout.trim());
    });
  });
};

module.exports = { runUserCodeCpp };
