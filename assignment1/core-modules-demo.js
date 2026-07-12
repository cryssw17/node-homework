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
//create path for stream txt called largefile.txt
const largeFile = path.join(__dirname, "sample-files", "largefile.txt");
//create writeStream loop to write a line x100
const writeStream = fs.createWriteStream(largeFile);
for (let i = 0; i < 100; i++) {
  writeStream.write("This is a lot of text\n");
}
writeStream.end();

//handles what occurs after stream write is complete
writeStream.on("finish", () => {
  //read stream in chunks
  //use highWaterMark to set chunk size
  const readStream = fs.createReadStream(largeFile, {
    encoding: "utf8",
    highWaterMark: 1024,
  });
  // data event, console log first 40 char chunk read (use chunk.substring(0,40))
  readStream.on("data", (chunk) => {
    console.log("Read chunk:", chunk.substring(0, 40));
  });
  //end event console log finished message at the end of the read
  readStream.on("end", () => {
    console.log("Finished reading large file with streams.");
  });
  //error event handle error case
  readStream.on("error", (err) => {
    console.log("Error reading file:", err.message);
  });
});
