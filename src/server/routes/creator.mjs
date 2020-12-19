/* eslint-disable spaced-comment */
import express from "express";
import { db } from "../index.mjs";

const router = express.Router();

router.post("/", async (req, res) => {
  const sql = /*sql*/ `
    SELECT DISTINCT issue.image, series.name, issue.issue_number, issue.id
    FROM issue
    JOIN worked_on_by
      ON worked_on_by.issue_id = issue.id
    JOIN creator
      ON creator.id = worked_on_by.creator_id
    JOIN series
      ON series.id = issue.series_id
    WHERE creator.name LIKE ? AND worked_on_by.role LIKE ?
    LIMIT 200
`;

  try {
    const rows = await db.all(sql, [
      `%${req.body.barInput}%`,
      `%${req.body.role}%`,
    ]);
    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.all" });
  }
});

export default router;
