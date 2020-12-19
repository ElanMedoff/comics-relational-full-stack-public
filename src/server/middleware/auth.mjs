import { db } from "../index.mjs";

export default async function authenticate(req, res, next) {
  if (!req.cookies.sessionId) {
    return res.status(440).json({ message: "Session expired, no cookie!" });
  }

  let username;
  try {
    // search database for a valid token, return the username
    const row = await db.get(
      /*sql*/ `SELECT user_name AS username, expiration FROM session WHERE session_id = ?`,
      [req.cookies.sessionId]
    );

    if (row && row.username && row.expiration) {
      const { expiration } = row;
      username = row.username;

      // Check that expiration is fine
      if (Date.parse(expiration) < Date.now()) {
        return res
          .status(440)
          .json({ message: "Session expired, past expiration date!" });
      }

      res.username = username;
    }
  } catch (e) {
    return res.status(500).json({ message: e.message, location: "db.get" });
  }

  if (req.body.listId) {
    try {
      const row = await db.get(
        /*sql*/ `SELECT user_name AS listUsername FROM has_list WHERE list_id = ?`,
        [req.body.listId]
      );
      const { listUsername } = row;

      if (listUsername !== username) {
        return res
          .status(440)
          .json({ message: "You don't have access to this list!" });
      }
    } catch (e) {
      return res.status(500).json({ message: e.message, location: "db.get" });
    }
  }

  return next();
}
