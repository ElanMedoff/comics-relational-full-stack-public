import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import myFetch from "client/utilities/myFetch";
import styles from "./Issue.module.scss";

export default function Issue() {
  const [issueInfo, setIssueInfo] = useState({});
  const { search } = useLocation();
  const { id } = queryString.parse(search);

  useEffect(() => {
    const fetchIssueInfo = async () => {
      const res = await myFetch(
        "GET",
        `http://localhost:3000/api/issue/info/${id}`
      );
      const data = await res.json();
      setIssueInfo(data);

      if (res.status !== 200) {
        console.error(`ERROR: ${data.message}`);
      } else {
        console.info("Fetching isLogged in", data);
      }
    };

    fetchIssueInfo();
  }, []);

  const {
    issueImage,
    issueCoverPrice,
    issueName,
    issueNumber,
    issueReleaseDate,
    characters,
    events,
    creators,
  } = issueInfo;

  let prettyDate;
  if (issueReleaseDate) {
    const ogDate = new Date(Date.parse(issueReleaseDate));
    prettyDate = `${ogDate.getDate()}/${ogDate.getDay()}/${ogDate.getFullYear()}`;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.imageOthers}>
        <img className={styles.issueImage} src={issueImage} alt="issue" />
        <div className={styles.titleCard}>
          <div className={styles.titleInfo}>
            <h1>{issueName}</h1>
            <div className={styles.info}>
              <span>Issue #{issueNumber}</span>
              {issueCoverPrice > 0 && (
                <span>Cover price ${issueCoverPrice}</span>
              )}
              <span>Release Date: {prettyDate && prettyDate}</span>
            </div>
          </div>
          <div className={styles.cards}>
            <ul className={styles.card}>
              <h1>Characters</h1>
              {characters &&
                characters.map(({ characterName, characterImage }, index) => (
                  <li key={index} className={styles.cardItem}>
                    <img alt="character" src={characterImage} />
                    <span>{characterName}</span>
                  </li>
                ))}
            </ul>
            <ul className={styles.card}>
              <h1>Creators</h1>
              {creators &&
                creators.map(
                  ({ creatorName, creatorImage, creatorRole }, index) => (
                    <li key={index} className={styles.cardItem}>
                      <img alt="character" src={creatorImage} />
                      <span>{creatorName}</span>
                      <span className={styles.role}>{creatorRole}</span>
                    </li>
                  )
                )}
            </ul>
            <ul className={styles.card}>
              <h1>Events</h1>
              {events &&
                events.map(({ eventName, eventImage }, index) => (
                  <li key={index} className={styles.cardItem}>
                    <img alt="character" src={eventImage} />
                    <span>{eventName}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
