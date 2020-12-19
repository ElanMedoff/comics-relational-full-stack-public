const md5 = require("md5");
const fetch = require("node-fetch");
const Database = require("sqlite-async");
const path = require("path");
require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;
const url = `http://gateway.marvel.com/v1/public/`;

async function scrape(offset) {
  //Open db connection
  const dbPath = path.resolve(__dirname, "../server/db/updated.sqlite3");
  let db;
  try {
    db = await Database.open(dbPath);
  } catch (e) {
    console.log(e);
  }

  // Get a list of all the series
  let allSeries;
  try {
    const ts = Date.now();
    const hash = md5(`${ts}${privateKey}${publicKey}`);
    console.log("Fetching all series");
    const res = await fetch(
      `${url}series?apikey=${publicKey}&ts=${ts}&hash=${hash}&contains=comic&orderBy=startYear&limit=100&offset=${offset}`
    );
    allSeries = await res.json();
  } catch (e) {
    console.log(e);
  }

  console.log(allSeries, allSeries.data);

  if (allSeries && allSeries.data && allSeries.data.results) {
    for (const series of allSeries.data.results) {
      // Insert series into db
      try {
        console.log("Inserting series into db.");
        await db.run(
          "INSERT INTO series(id, name, description, start_year, end_year, is_current) VALUES(?,?,?,?,?,?)",
          [
            series.id,
            series.title,
            series.description,
            series.startYear,
            series.endYear === 2099 ? NULL : series.endYear,
            series.endYear === 2099 ? 1 : 0,
          ]
        );
      } catch (e) {
        console.log(e);
      }

      // Scrape all the issues issues in the series
      for (const issue of series.comics.items) {
        let fullIssues;
        try {
          const ts = Date.now();
          const hash = md5(`${ts}${privateKey}${publicKey}`);
          console.log("Fetching all issues in a given series.");
          const res = await fetch(
            `${issue.resourceURI}?apikey=${publicKey}&ts=${ts}&hash=${hash}`
          );
          fullIssues = await res.json();
        } catch (e) {
          console.log(e);
        }

        // Insert issue into the db
        if (
          fullIssues &&
          fullIssues.data &&
          fullIssues.data.results &&
          fullIssues.data.results[0]
        ) {
          const fullIssue = fullIssues.data.results[0];
          try {
            console.log("Insert issue in the db.");
            await db.run(
              "INSERT INTO issue(id, issue_number, series_id, page_count, cover_price, release_date, image) VALUES(?,?,?,?,?,?, ?)",
              [
                fullIssue.id,
                fullIssue.issueNumber,
                series.id,
                fullIssue.pageCount,
                fullIssue.prices.find((price) => price.type === "printPrice")
                  .price,
                fullIssue.dates.find((date) => date.type === "onsaleDate").date,
                `${fullIssue.thumbnail.path}/portrait_uncanny.${fullIssue.thumbnail.extension}`,
              ]
            );
          } catch (e) {
            console.log(e);
          }

          for (const character of fullIssue.characters.items) {
            // Insert characters that appear in
            const characterId = character.resourceURI.slice(
              character.resourceURI.search("characters/") + "characters/".length
            );

            try {
              console.log("Inserting into appears_in.");
              await db.run(
                "INSERT INTO appears_in(issue_id, character_id) VALUES(?,?)",
                [fullIssue.id, characterId]
              );
            } catch (e) {
              console.log(e);
            }

            // Check if the character is already in the db
            let isCharacterAlreadyStored = true;
            try {
              console.log("Checking if a character is in the db.");
              const rows = await db.all("SELECT * FROM character WHERE id=?", [
                characterId,
              ]);
              if (rows.length === 0) isCharacterAlreadyStored = false;
            } catch (e) {
              console.log(e);
            }

            // If the character is not already in the db, scrape them
            let fullCharacters;
            if (!isCharacterAlreadyStored) {
              try {
                const ts = Date.now();
                const hash = md5(`${ts}${privateKey}${publicKey}`);
                console.log("Fetching characters.");
                const res = await fetch(
                  `${character.resourceURI}?apikey=${publicKey}&ts=${ts}&hash=${hash}`
                );
                fullCharacters = await res.json();
              } catch (e) {
                console.log(e);
              }

              // Add the character into the db
              if (
                fullCharacters &&
                fullCharacters.data &&
                fullCharacters.data.results &&
                fullCharacters.data.results[0]
              ) {
                const fullCharacter = fullCharacters.data.results[0];
                try {
                  console.log("Inserting character into the db.");
                  await db.run(
                    "INSERT INTO character(id, name, description, image) VALUES(?,?,?,?)",
                    [
                      fullCharacter.id,
                      fullCharacter.name,
                      fullCharacter.description,
                      `${fullCharacter.thumbnail.path}/portrait_uncanny.${fullCharacter.thumbnail.extension}`,
                    ]
                  );
                } catch (e) {
                  console.log(e);
                }
              }
            }
          }

          for (const creator of fullIssue.creators.items) {
            // Insert creators that work on
            const creatorId = creator.resourceURI.slice(
              creator.resourceURI.search("creators/") + "creators/".length
            );

            try {
              console.log("Inserting into worked_on_by.");
              await db.run(
                "INSERT INTO worked_on_by(issue_id, creator_id, role) VALUES(?,?,?)",
                [fullIssue.id, creatorId, creator.role]
              );
            } catch (e) {
              console.log(e);
            }

            // Check if the creator is already in the db
            let isCreatorAlreadyStored = true;
            try {
              console.log("Check if creator is already in the db.");
              const rows = await db.all("SELECT * FROM creator WHERE id=?", [
                creatorId,
              ]);
              if (rows.length === 0) isCreatorAlreadyStored = false;
            } catch (e) {
              console.log(e);
            }

            let fullCreators;
            if (!isCreatorAlreadyStored) {
              try {
                const ts = Date.now();
                const hash = md5(`${ts}${privateKey}${publicKey}`);

                console.log("Fetching creators.");
                const res = await fetch(
                  `${creator.resourceURI}?apikey=${publicKey}&ts=${ts}&hash=${hash}`
                );
                fullCreators = await res.json();
              } catch (e) {
                console.log(e);
              }

              // Add the character into the db
              if (
                fullCreators &&
                fullCreators.data &&
                fullCreators.data.results &&
                fullCreators.data.results[0]
              ) {
                const fullCreator = fullCreators.data.results[0];
                try {
                  console.log("Inserting creator into the db.");
                  await db.run(
                    "INSERT INTO creator(id, name, image) VALUES(?,?,?)",
                    [
                      fullCreator.id,
                      fullCreator.fullName,
                      `${fullCreator.thumbnail.path}/portrait_uncanny.${fullCreator.thumbnail.extension}`,
                    ]
                  );
                } catch (e) {
                  console.log(e);
                }
              }
            }
          }

          for (const event of fullIssue.events.items) {
            // Insert events that the issue is a part of
            const eventId = event.resourceURI.slice(
              event.resourceURI.search("events/") + "events/".length
            );

            try {
              console.log("Inserting into in_event.");
              await db.run(
                "INSERT INTO in_event(issue_id, event_id) VALUES(?,?)",
                [fullIssue.id, eventId]
              );
            } catch (e) {
              console.log(e);
            }

            // Check if the event is already in the db
            let isEventAlreadyStored = true;
            try {
              console.log("Checking if event is already in the db.");
              const rows = await db.all("SELECT * FROM event WHERE id=?", [
                eventId,
              ]);
              if (rows.length === 0) isEventAlreadyStored = false;
            } catch (e) {
              console.log(e);
            }

            let fullEvents;
            if (!isEventAlreadyStored) {
              try {
                const ts = Date.now();
                const hash = md5(`${ts}${privateKey}${publicKey}`);

                console.log("Fetching events.");
                const res = await fetch(
                  `${event.resourceURI}?apikey=${publicKey}&ts=${ts}&hash=${hash}`
                );
                fullEvents = await res.json();
              } catch (e) {
                console.log(e);
              }

              // Add the event into the db
              if (
                fullEvents &&
                fullEvents.data &&
                fullEvents.data.results &&
                fullEvents.data.results[0]
              ) {
                const fullEvent = fullEvents.data.results[0];
                try {
                  console.log("Inserting event into the db.");
                  await db.run(
                    "INSERT INTO event(id, name, description, start_date, end_date, is_current, image) VALUES(?,?,?,?,?,?,?)",
                    [
                      fullEvent.id,
                      fullEvent.title,
                      fullEvent.description,
                      fullEvent.start,
                      fullEvent.end,
                      fullEvent.end ? 0 : 1,
                      `${fullEvent.thumbnail.path}/portrait_uncanny.${fullEvent.thumbnail.extension}`,
                    ]
                  );
                } catch (e) {
                  console.log(e);
                }
              }
            }
          }
        }
      }
    }
  }
}

// Started at 800
scrape(1900);
