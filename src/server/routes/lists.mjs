import express from "express";
import { db } from "../index.mjs";
import auth from "../middleware/auth.mjs";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  let listIds;

  if (!res.username)
    return res.status(200).json({ message: "No user, no lists!" });

  try {
    listIds = await db.all(
      /*sql*/ `SELECT list_id AS listId FROM has_list WHERE user_name = ?`,
      [res.username]
    );
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.all" });
  }

  const lists = [];

  // Shape:
  // [
  //   {
  //     id,
  //     name,
  //     list: [
  //       {issueId, rank}
  //     ]
  //   },
  //   {
  //     id,
  //     name,
  //     list: [
  //       {issueId, rank}
  //     ]
  //   },
  // ]

  if (listIds) {
    try {
      for (const listIdWrapper of listIds) {
        const listIdNameWrapper = await db.all(
          /*sql*/ `SELECT name FROM list WHERE id = ?`,
          [listIdWrapper.listId]
        );

        const issueIdRankWrapper = await db.all(
          /*sql*/ `SELECT rank, issue_id AS issueId FROM list_contains WHERE list_id = ?`,
          [listIdWrapper.listId]
        );

        lists.push({
          listId: listIdWrapper.listId,
          name: listIdNameWrapper[0].name,
          list: issueIdRankWrapper,
        });
      }

      return res.status(200).json(lists);
    } catch (e) {
      return res.status(500).json({ message: e.message, location: "db.all" });
    }
  }

  return res.status(200).json({ message: "No lists for that user!" });
});

// Update an existing list entirely
router.post("/update", auth, async (req, res) => {
  try {
    await db.run(/*sql*/ `DELETE FROM list_contains WHERE list_id = ?`, [
      req.body.listId,
    ]);
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.run" });
  }

  for (const issueRanked of req.body.issuesRanked) {
    try {
      await db.run(
        /*sql*/ `INSERT INTO list_contains(list_id, rank, issue_id) VALUES(?,?,?)`,
        [req.body.listId, issueRanked.rank, issueRanked.issueId]
      );
    } catch (e) {
      res.status(500).json({ message: e.message, location: "db.run" });
    }
  }

  return res.status(200).json(`List ${req.body.listId} updated`);
});

// Append to an existing list
router.post("/append", auth, async (req, res) => {
  // Get current issueIds in the list
  let existingIds;
  try {
    const rows = await db.all(
      /*sql*/ `SELECT issue_id AS issueId, rank FROM list_contains WHERE list_id = ?`,
      [req.body.listId]
    );
    existingIds = rows.map((curr) => curr.issueId);
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.all" });
  }

  // Filter out the new list ot kill the existing items
  const filteredIssuesRanked = req.body.issuesRanked.filter(
    (curr) => !existingIds.includes(curr.issueId)
  );

  let highestRank;
  try {
    const row = await db.get(
      /*sql*/ `SELECT MAX(rank) AS rank FROM list_contains WHERE list_id = ?`,
      [req.body.listId]
    );

    highestRank = row.rank;
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.get" });
  }

  const updatedOrdering = filteredIssuesRanked.reduce((accum, curr) => {
    return [...accum].concat([
      {
        issueId: curr.issueId,
        rank: curr.rank + highestRank,
      },
    ]);
  }, []);

  for (const issueRanked of updatedOrdering) {
    try {
      await db.run(
        /*sql*/ `INSERT INTO list_contains(list_id, rank, issue_id) VALUES(?,?,?)`,
        [req.body.listId, issueRanked.rank, issueRanked.issueId]
      );
    } catch (e) {
      res.status(500).json({ message: e.message, location: "db.run" });
    }
  }

  try {
    const rows = await db.all(
      /*sql*/ `SELECT rank, issue_id AS issueId FROM list_contains WHERE list_id = ? `,
      [req.body.listId]
    );
    return res.status(200).json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.all" });
  }
});

// Add a new list
router.post("/add", auth, async (req, res) => {
  let newId;
  try {
    const row = await db.get(/*sql*/ `SELECT MAX(id) AS id FROM list`);
    newId = row.id + 1;
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.get" });
  }

  try {
    await db.run(/*sql*/ `INSERT INTO list (id, name) VALUES (?, ?)`, [
      newId,
      req.body.newList,
    ]);
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.run" });
  }

  try {
    await db.run(
      /*sql*/ `INSERT INTO has_list (user_name, list_id) VALUES (?, ?)`,
      [res.username, newId]
    );
  } catch (e) {
    res.status(500).json({ message: e.message, location: "db.run" });
  }

  return res
    .status(200)
    .json({ message: `List ${req.body.newList} added`, listId: newId });
});

export default router;
