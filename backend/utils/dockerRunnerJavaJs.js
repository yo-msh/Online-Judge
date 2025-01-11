const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const runUserCodeJavaJs = (language, code, input) => {
    return new Promise((resolve, reject) => {
      const uniqueId = Date.now();
      const codePath = path.join(__dirname, `temp_code_${uniqueId}.${language === "java" ? "java" : language === "javascript" ? "js" : "txt"}`);
      const inputPath = path.join(__dirname, `temp_input_${uniqueId}.txt`);
  
      fs.writeFileSync(codePath, code);
      fs.writeFileSync(inputPath, input || "");
  
      let dockerCommand = "";
  
      if (language === "java") {
        dockerCommand = `docker run --rm -v ${codePath}:/app/Code.java -v ${inputPath}:/app/input.txt sandbox-java:v1`;
      } else if (language === "javascript") {
        dockerCommand = `docker run --rm -v ${codePath}:/app/Code.js -v ${inputPath}:/app/input.txt sandbox-js:v1`;
      }
  
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
  
  module.exports = { runUserCodeJavaJs };
  