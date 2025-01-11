const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const runUserCodeJava = (code, input) => {
  return new Promise((resolve, reject) => {
    const uniqueId = Date.now();
    const codePath = path.join(__dirname, `temp_code_${uniqueId}.java`);
    const inputPath = path.join(__dirname, `temp_input_${uniqueId}.txt`);

    // Write code and input to temporary files
    fs.writeFileSync(codePath, code);
    fs.writeFileSync(inputPath, input || "");

    // Docker command for Java
    const dockerCommand = `docker run --rm -v ${codePath}:/app/Code.java -v ${inputPath}:/app/input.txt sandbox-java:v1`;

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

module.exports = { runUserCodeJava };
