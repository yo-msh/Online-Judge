const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const runUserCodeJs = (code, input) => {
  return new Promise((resolve, reject) => {
    console.log("executing docker command", dockerCommand);

    const uniqueId = Date.now();
    const codePath = path.join(__dirname, `temp_code_${uniqueId}.js`);
    const inputPath = path.join(__dirname, `temp_input_${uniqueId}.txt`);

    // Write code and input to temporary files
    fs.writeFileSync(codePath, code);
    fs.writeFileSync(inputPath, input || "");

    // Docker command for JavaScript
    const dockerCommand = `docker run --rm -v ${codePath}:/app/Code.js -v ${inputPath}:/app/input.txt sandbox-js:v1`;

    exec(dockerCommand, (error, stdout, stderr) => {
      // Cleanup temporary files
      fs.unlinkSync(codePath);
      fs.unlinkSync(inputPath);

      if (error) {
        return reject(stderr || error.message);
      }

      resolve(stdout.trim());
    });
  });
};

module.exports = { runUserCodeJs };
