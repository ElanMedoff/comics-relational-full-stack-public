import React, { useState, useEffect } from "react";
import propTypes from "prop-types";
import { AiOutlineLink } from "react-icons/ai";
import { IconContext } from "react-icons";
import { Link } from "react-router-dom";
import styles from "./SearchList.module.scss";

export default function SearchList({
  name,
  id,
  setSelectedLists,
  haveIssuesAdded,
}) {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isChecked && haveIssuesAdded) setIsChecked(false);
  }, [haveIssuesAdded]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <IconContext.Provider value={{ className: "svgArrow" }}>
        <input
          type="checkbox"
          id={id}
          name={id}
          checked={isChecked}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedLists((prev) => [...prev].concat([id]));
            } else {
              setSelectedLists((prev) =>
                prev.filter((currId) => currId !== id)
              );
            }
            setIsChecked(e.target.checked);
          }}
        />
        <label htmlFor={id}>{name}</label>
        <Link
          to={{
            pathname: "/lists",
            search: `?id=${id}`,
          }}
        >
          <span className={styles.arrow}>
            <AiOutlineLink size={22} />
          </span>
        </Link>
      </IconContext.Provider>
    </div>
  );
}

SearchList.propTypes = {
  name: propTypes.string.isRequired,
  id: propTypes.number.isRequired,
  setSelectedLists: propTypes.func.isRequired,
  haveIssuesAdded: propTypes.bool.isRequired,
};
