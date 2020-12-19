import React, { useState, useEffect } from "react";
import propTypes from "prop-types";
import { AiOutlineLink } from "react-icons/ai";
import { IconContext } from "react-icons";
import { Link } from "react-router-dom";
import styles from "./IssueItem.module.scss";

export default function IssueItem({
  imageLink,
  seriesName,
  issueNumber,
  issueId,
  setIssuesToAdd,
  haveIssuesAdded,
  showCheckbox = false,
}) {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isChecked && haveIssuesAdded) setIsChecked(false);
  }, [haveIssuesAdded]);

  return (
    <div className={styles.outer}>
      <div className={styles.wrapper}>
        <img src={imageLink} alt="issue" />
        <div className={styles.name}>{seriesName}</div>
        <div className={styles.number}>{issueNumber}</div>
        <IconContext.Provider value={{ className: "svgArrow issueItemArrow" }}>
          <Link
            to={{
              pathname: "/issue",
              search: `?id=${issueId}`,
            }}
          >
            <AiOutlineLink size={30} />
          </Link>
        </IconContext.Provider>
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              if (e.target.checked && setIssuesToAdd) {
                setIssuesToAdd((prev) => [...prev].concat([issueId]));
              } else {
                setIssuesToAdd((prev) =>
                  prev.filter((prevId) => prevId !== issueId)
                );
              }
              setIsChecked(e.target.checked);
            }}
          />
        )}
      </div>
    </div>
  );
}

IssueItem.propTypes = {
  imageLink: propTypes.string.isRequired,
  seriesName: propTypes.string.isRequired,
  issueNumber: propTypes.number.isRequired,
  issueId: propTypes.number.isRequired,
  setIssuesToAdd: propTypes.func,
  haveIssuesAdded: propTypes.bool,
  showCheckbox: propTypes.bool,
};
