/* eslint-disable spaced-comment */
import express from "express";
import { db } from "../index.mjs";

const router = express.Router();

router.post("/", async (req, res) => {
  let sql = /*sql*/ `
    SELECT DISTINCT issue.image, series.name, issue.issue_number, issue.id
    FROM issue
    JOIN series
      ON series.id = issue.series_id
    WHERE series.name LIKE "%${req.body.barInput}%"
  `;

  // Handle isCurrent
  if (
    req.body.isSeriesCurrent !== null &&
    req.body.isSeriesCurrent !== undefined
  ) {
    sql += /*sql*/ ` AND series.is_current = ${
      req.body.isSeriesCurrent ? 1 : 0
    }`;
  }

  // Handle cover price
  if (req.body.coverPrice) {
    sql += /*sql*/ ` AND issue.cover_price= ${req.body.coverPrice}`;
  }

  //Handle series date
  if (req.body.seriesStartDate && req.body.seriesEndDate) {
    sql += /*sql*/ ` AND series.start_year >= ${req.body.seriesStartDate} AND series.end_year <= ${req.body.seriesEndDate}`;
  } else if (req.body.seriesStartDate && !req.body.seriesEndDate) {
    sql += /*sql*/ ` AND series.start_year >= ${req.body.seriesStartDate}`;
  } else if (!req.body.seriesStartDate && req.body.seriesEndDate) {
    sql += /*sql*/ ` AND series.end_year <= ${req.body.seriesEndDate}`;
  }

  //Handle issue date
  if (req.body.issueStartDate && req.body.issueEndDate) {
    sql += /*sql*/ ` AND issue.release_date BETWEEN "${req.body.issueStartDate}" AND "${req.body.issueEndDate}"`;
  } else if (req.body.issueStartDate && !req.body.issueEndDate) {
    sql += /*sql*/ ` AND issue.release_date >= "${req.body.issueStartDate}"`;
  } else if (!req.body.issueStartDate && req.body.issueEndDate) {
    sql += /*sql*/ ` AND issue.release_date <= "${req.body.issueEndDate}"`;
  }

  sql += " LIMIT 200";

  try {
    const rows = await db.all(sql, []);
    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json("error in db.all");
  }
});

export default router;
