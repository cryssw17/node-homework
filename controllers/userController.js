const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const pool = require("../db/pg-pool");

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

async function register(req, res, next) {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }

  let newUser = null;

  value.hashed_password = await hashPassword(value.password);

  try {
    newUser = await pool.query(
      `INSERT INTO users (email, name, hashed_password)
    VALUES ($1, $2, $3) RETURNING id, email, name`,
      [value.email, value.name, value.hashed_password],
    );
  } catch (e) {
    if (e.code === "23505") {
      return res.status(400).json({
        message: "User already exists. Please login instead.",
      });
    }
    return next(e);
  }

  //add to global.users & set global.user_id
  global.user_id = newUser.rows[0].id;

  //return 201 status and json w/ name and email
  return res.status(201).json({
    name: newUser.rows[0].name,
    email: newUser.rows[0].email,
  });
}

async function logon(req, res) {
  const { email, password } = req.body;

  //find matching email
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Task not found or access denied" });
  }

  const goodCredentials = await comparePassword(
    password,
    result.rows[0].hashed_password,
  );

  //if matched, set user to global.user_id
  if (goodCredentials) {
    global.user_id = result.rows[0].id;

    //return 200 status and json w/ name and email
    return res.status(200).json({
      name: result.rows[0].name,
      email: result.rows[0].email,
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
