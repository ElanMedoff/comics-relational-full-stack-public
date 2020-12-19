import React, { Fragment, useState, useContext } from "react";
import GlobalStateContext from "client/contexts/globalStateContext";
import propTypes from "prop-types";
import SearchList from "client/comps/SearchList";
import myFetch from "client/utilities/myFetch";
import styles from "./SearchLists.module.scss";

export default function SearchLists({
  addIssuesToList,
  setHaveIssuesAdded,
  haveIssuesAdded,
}) {
  const globalState = useContext(GlobalStateContext);
  const [selectedLists, setSelectedLists] = useState([]);
  const [input, setInput] = useState("");

  const addList = async () => {
    if (input) {
      const res = await myFetch("POST", "http://localhost:3000/api/lists/add", {
        newList: input,
      });
      const data = await res.json();
      const { listId } = data;

      if (res.status !== 200) {
        console.error(`ERROR: ${data.message}`);
      } else {
        console.info(`Adding list ${input}`, data);
      }

      globalState.setLists((prev) => {
        return [...prev].concat([{ listId, name: input, list: [] }]);
      });
    } else {
      alert("List name cannot be empty!");
    }
  };

  return (
    <div className={styles.wrapper}>
      {globalState.username ? (
        <div className={styles.listsAddWrapper}>
          <div className={styles.lists}>
            <h1>User-created lists</h1>
            {globalState.lists &&
              globalState.lists.map((list, index) => (
                <Fragment key={index}>
                  <SearchList
                    name={list.name}
                    id={list.listId}
                    setSelectedLists={setSelectedLists}
                    haveIssuesAdded={haveIssuesAdded}
                  />
                </Fragment>
              ))}
            <button
              type="submit"
              onClick={() => {
                addIssuesToList(selectedLists);
                setHaveIssuesAdded((prev) => !prev);
              }}
            >
              Add issues to list!
            </button>
          </div>
          <div className={styles.addList}>
            <input
              className={styles.addListInput}
              type="text"
              placeholder="create a new list"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="justify-center">
              <button
                type="button"
                onClick={() => {
                  addList();
                  setInput("");
                }}
              >
                Add new list!
              </button>
            </div>
          </div>
        </div>
      ) : (
        <h1>Login to create lists!</h1>
      )}
    </div>
  );
}

SearchLists.propTypes = {
  addIssuesToList: propTypes.func.isRequired,
  setHaveIssuesAdded: propTypes.func.isRequired,
  haveIssuesAdded: propTypes.bool.isRequired,
};
