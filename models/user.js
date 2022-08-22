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

  static async updateLoginTimestamp(username) {
    const currentTime = new Date();
    const result = await db.query(
      `UPDATE users
      SET last_login_at = $1
      WHERE username = $2
      RETURNING username, last_login_at; 
      `,
      [currentTime, username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;
  }

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
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id,
                  m.to_username,
                  t.first_name AS to_first_name,
                  t.last_name AS to_last_name,
                  t.phone AS to_phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS t ON m.to_username = t.username
                    WHERE m.from_username = $1`,
      [username]
    );

    const messages = result.rows.map((m) => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.to_first_name,
        last_name: m.to_last_name,
        phone: m.to_phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));

    return messages;
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
      `SELECT m.id,
                  m.from_username,
                  f.first_name AS from_first_name,
                  f.last_name AS from_last_name,
                  f.phone AS from_phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS f ON m.from_username = f.username
             WHERE m.to_username = $1`,
      [username]
    );

    const messages = result.rows.map((m) => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.from_first_name,
        last_name: m.from_last_name,
        phone: m.from_phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
    return messages;
  }
}

module.exports = User;
