/* eslint-disable spaced-comment */
import express from "express";
import { db } from "../index.mjs";

const router = express.Router();

router.post("/", async (req, res) => {
  const sql = /*sql*/ `
    SELECT DISTINCT issue.image, series.name, issue.issue_number, issue.id
    FROM issue
    JOIN appears_in
      ON appears_in.issue_id = issue.id
    JOIN character
      ON character.id = appears_in.character_id
    JOIN series
      ON series.id = issue.series_id
    WHERE character.name LIKE ?
    LIMIT 200
  `;

  try {
    const rows = await db.all(sql, [`%${req.body.barInput}%`]);
    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.all" });
  }
});

export default router;
