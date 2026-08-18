const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const prisma = require("../db/prisma");

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

  value.hashedPassword = await hashPassword(value.password);

  delete value.password;

  try {
    const result = prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: value.name,
          email: value.email,
          hashedPassword: value.hashedPassword,
        },
        select: { name: true, email: true, id: true },
      });
      const welcomeTaskData = [
        { title: "Complete your profile", userId: user.id, priority: "medium" },
        { title: "Add your first task", userId: user.id, priority: "high" },
        { title: "Explore the app", userId: user.id, priority: "low" },
      ];
      await tx.task.createMany({ data: welcomeTaskData });

      const welcomeTasks = await tx.task.findMany({
        where: {
          userId: user.id,
          title: { in: welcomeTaskData.map((t) => t.title) },
        },
        select: {
          id: true,
          title: true,
          isCompleted: true,
          userId: true,
          priority: true,
        },
      });

      return { user, welcomeTasks };
    });
    //add to global.users & set global.user_id
    global.user_id = result.user.id;

    //send 201 status and json w/ name and email
    res.status(201).json({
      user: result.user,
      welcomeTasks: result.welcomeTasks,
      transactionStatus: "success",
    });
    return;
  } catch (err) {
    if (err.name === "PrismaClientKnownRequestError" && err.code === "P2002") {
      return res.status(400).json({
        message: "User already exists. Please login instead.",
      });
    } else {
      return next(err);
    }
  }
}

async function logon(req, res) {
  const { email, password } = req.body;

  const emailStandardized = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: emailStandardized },
  });

  if (user === null) {
    return res
      .status(404)
      .json({ error: "Authentication failed. Please try again." });
  }

  const goodCredentials = await comparePassword(password, user.hashedPassword);

  //if matched, set user to global.user_id
  if (goodCredentials) {
    global.user_id = user.id;

    //return 200 status and json w/ name and email
    return res.status(200).json({
      name: user.name,
      email: user.email,
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

async function show(req, res) {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      Task: {
        where: { isCompleted: false },
        select: {
          id: true,
          title: true,
          priority: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
}

module.exports = { register, logon, logoff, show };
