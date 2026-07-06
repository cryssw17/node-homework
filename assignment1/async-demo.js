const fs = require("fs");
const path = require("path");

// Write a sample file for demonstration
const filePath = path.join(__dirname, "sample-files", "sample.txt");
fs.writeFileSync(filePath, "Hello, async world!");

// 1. Callback style
fs.readFile(filePath, "utf8", (err, content) => {
  if (err) {
    console.log("File read failed: ", err.message);
    return;
  }
  console.log("Callback read: ", content);
});

// Callback hell example (test and leave it in comments):

// 2. Promise style
function readText(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, content) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(content);
    });
  });
}

readText(filePath)
  .then((content) => {
    console.log("Promise read: ", content);
  })
  .catch((err) => {
    console.log(err.message);
  });

// 3. Async/Await style
async function textRead() {
  try {
    const text = await fs.promises.readFile(filePath, "utf8");
    console.log("Async/await read: ", text);
  } catch (err) {
    console.log(err.message);
  }
}
textRead();
