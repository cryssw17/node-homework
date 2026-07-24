const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

async function register(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const hashedPassword = await hashPassword(value.password);

  //create new user object
  const newUser = {
    name: value.name,
    email: value.email,
    hashedPassword,
  };
  //add to global.users & set global.user_id
  global.users.push(newUser);
  global.user_id = newUser;

  //return 201 status and json w/ name and email
  return res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });
}

async function logon(req, res) {
  const { email, password } = req.body;

  //find matching email
  const matchedUser = global.users.find((u) => u.email === email);

  const goodCredentials =
    matchedUser &&
    (await comparePassword(password, matchedUser.hashedPassword));

  //if matched, set user to global.user_id
  if (goodCredentials) {
    global.user_id = matchedUser;

    //return 200 status and json w/ name and email
    return res.status(200).json({
      name: matchedUser.name,
      email: matchedUser.email,
    });
  } else {
    //return 401 if no match
    return res.status(401).json({
      message: "Authentication failed. Please try again.",
    });
  }
}

function logoff(req, res) {
  global.user_id = null;
  return res.status(200).send();
}

module.exports = { register, logon, logoff };
