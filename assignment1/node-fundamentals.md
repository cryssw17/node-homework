# Node.js Fundamentals

## What is Node.js?

Node.js is an environment that allows JavaScript to be run on a computer directly, without the need of a browser.

## How does Node.js differ from running JavaScript in the browser?

Since Node.js is not just confined to the browser, it allows for tasks like writing/reading files, starting web servers, working with the operating system, working with backend APIs, reading environment variables.

## What is the V8 engine, and how does Node use it?

An engine is a program that reads JavaScript and translates it into instructions for the computer to use. The V8 engine is what Google created to run JavaScript in the Chrome browser. Node.js uses this same engine to run JavaScript on the computer outside of the browser.

## What are some key use cases for Node.js?

Some use cases for Node include:

- Apps that need to push data in real-time such as dashboards or chat rooms, updates can be displayed instantly
- Creating APIs and servers
- Command line tools, create scripts that can run locally without a browser
- Build tools to bundle code

## Explain the difference between CommonJS and ES Modules. Give a code example of each.

CommonJS is used in Node and exports code using modules.export and imports with require().
ES Modules is used in browser side JS and exports code using export/export default and imports code with import. Node can also use ES Modules but files need to have the .mjs extension or extra configuration.

**CommonJS (default in Node.js):**

```js
//intro.js
function greeting(name) {
  return `Hi, I'm ${name}. Nice to meet you.`;
}

module.exports = { greeting };

//app.js
const { greeting } = require("./intro");

console.log(greeting("Crystal"));
```

**ES Modules (supported in modern Node.js):**

```js
//intro.mjs
function greeting(name) {
  return `Hi, I'm ${name}. Nice to meet you. `;
}

export { greeting };

//app.mjs
import { greeting } from "./intro.mjs";

console.log(greeting("Crystal"));
```
