const fs = require("fs");
const path = require("path");

// Write a sample file for demonstration
const filePath = path.join(__dirname, "sample-files", "sample.txt");
fs.writeFileSync(filePath, "Hello, async world!");

// 1. Callback style
fs.readFile(filePath, "utf8", (err, content) => {
  if (err) {
    console.log("File read failed:", err.message);
    return;
  }
  console.log("Callback read: ", content);
});

// Callback hell example (test and leave it in comments):
// const file1 = path.join(__dirname, "sample-files", "example.txt");
// fs.writeFile(file1, "this is an example file", (err) => {
//   if (err) {
//     console.log("example.txt write failed:");
//     return;
//   }
//   fs.readFile(file1, "utf8", (err, content1) => {
//     if (err) {
//       console.log("example.txt read failed:", err.message);
//       return;
//     }
//     const file2 = path.join(__dirname, "sample-files", "example2.txt");
//     fs.writeFile(file2, "this is another example", (err) => {
//       if (err) {
//         console.log("example2.txt write failed:", err.message);
//         return;
//       }
//       fs.readFile(file2, "utf8", (err, content2) => {
//         if (err) {
//           console.log("example2.txt read failed:", err.message);
//           return;
//         }
//         const combined = content1 + "\n" + content2;
//         const file3 = path.join(__dirname, "sample-files", "combined.txt");
//         fs.writeFile(file3, combined, (err) => {
//           if (err) {
//             console.log("combined.txt write failed");
//             return;
//           }
//           fs.readFile(file3, "utf8", (err, content3) => {
//             if (err) {
//               console.log("combined.txt read failed:", err.message);
//               return;
//             }
//             console.log("Combined text:", content3);
//             console.log("Callback hell example complete.");
//           });
//         });
//       });
//     });
//   });
// });

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
    console.log("Promise read:", content);
  })
  .catch((err) => {
    console.log(err.message);
  });

// 3. Async/Await style
async function textRead() {
  try {
    const text = await fs.promises.readFile(filePath, "utf8");
    console.log("Async/await read:", text);
  } catch (err) {
    console.log(err.message);
  }
}
textRead();
