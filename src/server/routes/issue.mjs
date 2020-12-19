/* eslint-disable spaced-comment */
import express from "express";
import { db } from "../index.mjs";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const sql = /*sql*/ `
    SELECT issue.image, series.name, issue.issue_number
    FROM issue
    JOIN series
      ON series.id = issue.series_id
    WHERE issue.id = ?
  `;

  try {
    const row = await db.get(sql, [req.params.id]);
    res.status(200).json(row);
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.get" });
  }
});

router.get("/info/:id", async (req, res) => {
  const issueSql = /*sql*/ `
    SELECT DISTINCT 
      issue.issue_number AS issueNumber,
      issue.cover_price AS issueCoverPrice, 
      issue.release_date AS  issueReleaseDate,
      issue.image AS issueImage,
      series.name AS issueName,
      series.description AS issueDescription
    FROM issue
    JOIN series
      ON series.id = issue.series_id
    WHERE issue.id = ?
  `;

  const characterSql = /*sql*/ `
    SELECT DISTINCT 
      character.name AS characterName,
      character.image AS characterImage
    FROM issue
    JOIN appears_in
      ON appears_in.issue_id = issue.id
    JOIN character
      ON character.id = appears_in.character_id
    WHERE issue.id = ?
  `;

  const creatorSql = /*sql*/ `
    SELECT DISTINCT 
      creator.name AS creatorName,
      creator.image AS creatorImage,
      worked_on_by.role AS creatorRole
    FROM issue
    JOIN worked_on_by 
      ON worked_on_by.issue_id = issue.id
    JOIN creator 
      ON creator.id = worked_on_by.creator_id
    WHERE issue.id = ?
  `;

  const eventSql = /*sql*/ `
    SELECT DISTINCT 
      event.name AS eventName,
      event.image AS eventImage
    FROM issue
    JOIN in_event
      ON in_event.issue_id = issue.id
    JOIN event 
      ON event.id = in_event.event_id
    WHERE issue.id = ?
  `;

  let fullInfo = {};

  try {
    const row = await db.get(issueSql, [req.params.id]);
    fullInfo = { ...row };
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.all issueSql" });
  }

  try {
    const rows = await db.all(characterSql, [req.params.id]);
    fullInfo.characters = rows;
  } catch (e) {
    res
      .status(500)
      .json({ message: e.message, location: "db.all characterSql" });
  }

  try {
    const rows = await db.all(eventSql, [req.params.id]);
    fullInfo.events = rows;
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.all eventSql" });
  }

  try {
    const rows = await db.all(creatorSql, [req.params.id]);
    fullInfo.creators = rows;
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.all creatorSql" });
  }

  try {
    res.status(200).json(fullInfo);
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.get" });
  }
});

export default router;
