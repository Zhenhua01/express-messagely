"use strict";

const Router = require("express").Router;
const router = new Router();

const { UnauthorizedError } = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY} = require("../config");
const User = require("../models/user.js");

/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {
  const { username, password } = req.body;
  debugger
  const validUser = await User.authenticate(username, password);
  debugger
  if (validUser) {
    await User.updateLoginTimestamp(username);
    const token = jwt.sign({ username }, SECRET_KEY);
    debugger
    return res.json({ token });
  }
  throw new UnauthorizedError("Invalid user/password");
});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  const { username, password, first_name, last_name, phone } = req.body;
  debugger
  const user = await User.register({ username, password, first_name, last_name, phone });
  debugger
  if (user) {
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }
});

module.exports = router;