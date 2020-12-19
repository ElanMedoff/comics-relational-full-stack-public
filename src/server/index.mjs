import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import Database from "sqlite-async";
import characterRouter from "./routes/character.mjs";
import creatorRouter from "./routes/creator.mjs";
import seriesRouter from "./routes/series.mjs";
import accountRouter from "./routes/account.mjs";
import eventRouter from "./routes/event.mjs";
import listsRouter from "./routes/lists.mjs";
import issueRouter from "./routes/issue.mjs";

const app = express();

// Hack to use __dirname in mjs file, is it still worth it?
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "./db/updated.sqlite3");

let db;
try {
  db = await Database.open(dbPath);
} catch (e) {
  throw e;
}

app.use(express.json());
app.use(cookieParser());
app.use("/api/character", characterRouter);
app.use("/api/creator", creatorRouter);
app.use("/api/series", seriesRouter);
app.use("/api/account", accountRouter);
app.use("/api/lists", listsRouter);
app.use("/api/event", eventRouter);
app.use("/api/issue", issueRouter);
app.all("*", (_, res) => {
  res.status(404);
});

const listener = app.listen(8080, () => {
  console.log(`Server running on port ${listener.address().port}`);
});

try {
  await db.close();
  console.log("Closing the database connection");
} catch (e) {
  console.log(e.message, "Error closing the database connection");
}

export { db };
