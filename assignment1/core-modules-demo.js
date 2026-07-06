const os = require("os");
const path = require("path");
const fs = require("fs");
const { fileURLToPath } = require("url");

const sampleFilesDir = path.join(__dirname, "sample-files");
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
console.log("Platform: ", os.platform());
const cpus = os.cpus();
console.log("CPU: ", cpus[0].model);
console.log("Total Memory: ", os.totalmem());

// Path module
const joinedPath = path.join("sample-files", "subfolder/file.txt");
console.log("Joined path: ", joinedPath);

// fs.promises API
async function promisesDemo() {
  const file = path.join(__dirname, "sample-files", "demo.txt");
  try {
    await fs.promises.writeFile(file, "Hello from fs.promises!");
    const content = await fs.promises.readFile(file, "utf8");
    console.log("fs.promises read: ", content);
  } catch (err) {
    console.log(err.message);
  }
}

promisesDemo();

// Streams for large files- log first 40 chars of each chunk
