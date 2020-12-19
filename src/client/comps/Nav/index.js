import React from "react";
import { Link } from "react-router-dom";
import Login from "client/comps/Login";
import styles from "./Nav.module.scss";

export default function Nav() {
  return (
    <div className={styles.titleNavigationLoginWrapper}>
      <div className={styles.titleNavigationWrapper}>
        <h2 className={styles.title}>
          <Link to="/">Comics full stack</Link>
        </h2>
      </div>

      <div>
        <Login />
      </div>
    </div>
  );

  //
}
