-- Comics
DROP TABLE IF EXISTS creator;
CREATE TABLE creator(
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  image TEXT
);

DROP TABLE IF EXISTS character;
CREATE TABLE character(
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT
);

DROP TABLE IF EXISTS event;
CREATE TABLE event(
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current INTEGER NOT NULL,
  image TEXT
);

DROP TABLE IF EXISTS series;
CREATE TABLE series(
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_year TEXT NOT NULL,
  end_year TEXT,
  is_current INTEGER NOT NULL
);

DROP TABLE IF EXISTS issue;
CREATE TABLE issue(
  id INTEGER PRIMARY KEY NOT NULL,
  issue_number INTEGER NOT NULL,
  series_id INTEGER,
  page_count INTEGER,
  cover_price REAL,
  release_date TEXT NOT NULL,
  image TEXT,

  FOREIGN KEY(series_id) REFERENCES series(id)
);

DROP TABLE IF EXISTS worked_on_by;
CREATE TABLE worked_on_by(
  issue_id INTEGER NOT NULL,
  creator_id INTEGER NOT NULL,
  role TEXT NOT NULL,

  FOREIGN KEY(issue_id) REFERENCES issue(id),
  FOREIGN KEY(creator_id) REFERENCES creator(id)
);

DROP TABLE IF EXISTS appears_in;
CREATE TABLE appears_in(
  issue_id INTEGER NOT NULL,
  character_id TEXT NOT NULL,

  FOREIGN KEY(issue_id) REFERENCES issue(id),
  FOREIGN KEY(character_id) REFERENCES character(id)
);

DROP TABLE IF EXISTS in_event;
CREATE TABLE in_event(
  issue_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,

  FOREIGN KEY(issue_id) REFERENCES issue(id),
  FOREIGN KEY(event_id) REFERENCES event(id)
);


-- Basic authentication
DROP TABLE IF EXISTS user;
CREATE TABLE user(
  name TEXT PRIMARY KEY NOT NULL,
  password TEXT NOT NULL
);

DROP TABLE IF EXISTS session;
CREATE TABLE session(
  session_id TEXT PRIMARY KEY NOT NULL,
  user_name TEXT NOT NULL,
  expiration TEXT NOT NULL,

  FOREIGN KEY(user_name) REFERENCES user(name)
);

-- User generated lists
DROP TABLE IF EXISTS list;
CREATE TABLE list(
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);

DROP TABLE IF EXISTS list_contains;
CREATE TABLE list_contains(
  list_id INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  issue_id INTEGER NOT NULL,

  FOREIGN KEY(issue_id) REFERENCES issue(id),
  FOREIGN KEY(list_id) REFERENCES list(id)
);

DROP TABLE IF EXISTS has_list;
CREATE TABLE has_list(
  user_name TEXT NOT NULL,
  list_id INTEGER PRIMARY KEY NOT NULL,

  FOREIGN KEY(list_id) REFERENCES list(id),
  FOREIGN KEY(user_name) REFERENCES user(name)
);