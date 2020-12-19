/* eslint-disable no-else-return */
/* eslint-disable no-console */
/* eslint-disable spaced-comment */
import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import auth from "../middleware/auth.mjs";
import { db } from "../index.mjs";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const nameRows = await db.all(/*sql*/ `SELECT name FROM user`, []);

    // Check if username is already taken
    if (nameRows.find((row) => row.name === req.body.username)) {
      return res.status(406).json({
        message: `The username: ${req.body.username} is already taken!`,
      });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ message: e.message, location: "db.all names" });
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await db.run(/*sql*/ `INSERT INTO user(name, password) VALUES(?, ?)`, [
      req.body.username,
      hashedPassword,
    ]);

    return res.status(201).json({
      message: `The username: ${req.body.username} has been created`,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: e.message, location: "db.run insert" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const rows = await db.all(/*sql*/ `SELECT name, password FROM user`, []);

    // First check if username is in the db
    if (!rows.find((row) => row.name === req.body.username)) {
      return res.status(406).json({
        message: `The username: ${req.body.username} is not in the db!`,
      });
    }

    // Check if the username and password match
    let isValidPassword = false;

    for (const row of rows) {
      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        row.password
      );

      if (row.name === req.body.username && isPasswordCorrect)
        isValidPassword = true;
    }

    if (!isValidPassword) {
      return res.status(401).json({
        message: "User's password and the passed-in password don't match!",
      });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ message: e.message, location: "db.all name, password" });
  }

  // Delete old sessions
  try {
    await db.run(
      /*sql*/ `DELETE FROM session WHERE expiration < "${new Date().toISOString()}"`,
      []
    );
  } catch (e) {
    return res
      .status(500)
      .json({ message: e.message, location: "db.run delete" });
  }

  try {
    const sessionId = crypto.randomBytes(64).toString("hex");
    // 10 minute
    const expiration = new Date(new Date().getTime() + 600000);
    await db.run(
      /*sql*/ `INSERT INTO session(session_id, user_name, expiration) VALUES(?,?,?)`,
      [sessionId, req.body.username, expiration.toISOString()]
    );
    res.cookie("sessionId", sessionId, {
      maxAge: 600000,
      httpOnly: true,
      sameSite: true,
    });
    return res.status(200).json({
      message: "Session id created.",
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: e.message, location: "db.run insert" });
  }
});

router.get("/logout", async (req, res) => {
  // Remove the tuple from the session table
  try {
    await db.run(
      /*sql*/ `DELETE FROM session WHERE session_id = ?`,
      req.cookies.sessionId
    );
    return res.status(200).json({
      message: `${req.cookies.sessionId} removed from the session table.`,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
      location: "db.run delete from session table",
    });
  }
});

router.get("/isLoggedIn", auth, (req, res) => {
  if (res.username) return res.status(200).json({ username: res.username });

  return res.status(440).json({ message: "No user logged in!" });
});

export default router;
