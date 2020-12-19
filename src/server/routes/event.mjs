/* eslint-disable spaced-comment */
import express from "express";
import { db } from "../index.mjs";

const router = express.Router();

router.post("/", async (req, res) => {
  let sql = /*sql*/ `
    SELECT DISTINCT issue.image, series.name, issue.issue_number, issue.id
    FROM issue
    JOIN in_event
      ON in_event.issue_id = issue.id
    JOIN event
      ON event.id = in_event.event_id
    JOIN series
      ON series.id = issue.series_id
    WHERE event.name LIKE "%${req.body.barInput}%"
  `;

  // Handle isCurrent
  if (
    req.body.isEventCurrent !== null &&
    req.body.isEventCurrent !== undefined
  ) {
    sql += /*sql*/ ` AND event.is_current = ${req.body.isEventCurrent ? 1 : 0}`;
  }

  //Handle event date range
  if (req.body.eventStartDate && req.body.eventEndDate) {
    sql += /*sql*/ ` AND event.start_date >= "${req.body.eventStartDate}" AND event.end_date <= "${req.body.eventEndDate}"`;
  } else if (req.body.eventStartDate && !req.body.eventEndDate) {
    sql += /*sql*/ ` AND event.start_date >= "${req.body.eventStartDate}"`;
  } else if (!req.body.eventStartDate && req.body.eventEndDate) {
    sql += /*sql*/ ` AND event.end_date <= "${req.body.eventEndDate}"`;
  }

  sql += " LIMIT 200";

  try {
    const rows = await db.all(sql, []);
    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.all" });
  }
});

export default router;
