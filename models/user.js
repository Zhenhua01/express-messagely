"use strict";

/** User of the site. */

const db = require("../db");
const bcrypt = require("bcrypt");
const BCRYPT_WORK_FACTOR = require("../config.js");

const { UnauthorizedError } = require("../expressError");

class User {
  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
         FROM users
         WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (user) {
      return (await bcrypt.compare(password, user.password)) === true;
    } else {
      return false;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {}

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
             FROM users`
    );

    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
              FROM users
              WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user:{username, first_name, last_name, phone}, body, sent_at, read_at}]
   * 
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id, m.to_username as to_user, m.body, m.sent_at, m.read_at
      FROM messages m
      JOIN users u ON m.from_username = u.username
      WHERE m.from_username = $1`,
      [username]
    );

    const messages = result.rows.map((u) => u.to_user = User.get(u.to_username));
    const messages = result.rows.map((m) => {id: m.id, to_user:{username: m.to_username, first_name, last_name, phone}, body, sent_at, read_at});


    // messages.map((m) => (m.to_user = to_user));

    //TODO:
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id, m.from_username as from_user, m.body, m.sent_at, m.read_at
      FROM messages m
      JOIN users u ON m.to_username = u.username
      WHERE m.to_username = $1`,
      [username]
    );

    const from_user = result.rows.map((u) => User.get(u.from_username));

    const messages = result.rows;

    messages.map((m) => (m.from_user = from_user));
  }
}

module.exports = User;
