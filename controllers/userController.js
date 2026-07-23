function register(req, res) {
  //create new user object
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
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

function logon(req, res) {
  const { email, password } = req.body;

  //find matching email/password user in global.users
  const matchedUser = global.users.find(
    (u) => u.email === email && u.password === password,
  );

  //if matched, set user to global.user_id
  if (matchedUser) {
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
