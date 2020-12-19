import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import GlobalStateContext from "client/contexts/globalStateContext";
import queryString from "query-string";
import myFetch from "client/utilities/myFetch";
import IssueItem from "client/comps/IssueItem";
import styles from "./Lists.module.scss";

export default function Lists() {
  const { search } = useLocation();
  const { id } = queryString.parse(search);
  const globalState = useContext(GlobalStateContext);
  const [currentList, setCurrentList] = useState([]);
  const [listName, setListName] = useState("");

  useEffect(() => {
    if (globalState.lists) {
      // Find the right list from the global state
      const filteredList = globalState.lists.filter((curr) => {
        return curr.listId === parseInt(id);
      })[0];

      // fetch the additional info for each issue in the list
      const fetchIssueInfo = async () => {
        const promiseArray = await filteredList.list.map(async (curr) => {
          const res = await myFetch(
            "GET",
            `http://localhost:3000/api/issue/${curr.issueId}`
          );
          const data = await res.json();

          if (res.status !== 200) {
            console.error(`ERROR: ${data.message}`);
          } else {
            console.info(`Fetching info for issue id: ${curr.issueId}`, data);
          }

          return {
            ...curr,
            image: data.image,
            issue_number: data.issue_number,
            name: data.name,
          };
        });

        const updatedList = await Promise.all(promiseArray);

        setCurrentList(updatedList);
        setListName(filteredList.name);
      };

      if (filteredList && filteredList.list) fetchIssueInfo();
    }
  }, [globalState.lists]);

  const handleOnDragEnd = (result) => {
    const items = Array.from(currentList);
    const ogSourceRank = items[result.source.index].rank;
    const ogDestinationRank = items[result.destination.index].rank;
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reRankedItems = items.map((curr, index) => {
      if (index === result.destination.index) {
        return {
          ...curr,
          rank: ogDestinationRank,
        };
      }

      if (index === result.source.index) {
        return {
          ...curr,
          rank: ogSourceRank,
        };
      }

      return { ...curr };
    });

    setCurrentList(reRankedItems);
  };

  const updateOrdering = async () => {
    const res = await myFetch(
      "POST",
      "http://localhost:3000/api/lists/update",
      {
        listId: id,
        issuesRanked: currentList,
      }
    );

    const data = await res.json();

    if (res.status !== 200) {
      console.error(`ERROR: ${data.message}`);
    } else {
      console.info(`Updating the order for list id: ${id}`, data);
    }

    globalState.setLists((prev) => {
      return prev.map((curr) => {
        if (curr.listId === parseInt(id)) {
          return {
            ...curr,
            list: currentList.map(({ rank, issueId }) => ({
              rank,
              issueId,
            })),
          };
        }
        return { ...curr };
      });
    });

    alert("List order updated!");
  };

  return (
    <div className="flex-column">
      {globalState.username && (
        <>
          <h1 className={styles.h1}>{listName && listName}</h1>
          <h2 className={styles.h2}>drag and drop to reorder the list!</h2>
          <div className={styles.scaffold}>
            {currentList.map((_, index) => {
              console.log(index);
              return (
                <div key={index} className={styles.scaffoldItem}>
                  {index + 1}
                </div>
              );
            })}

            <div className={styles.listButton}>
              <>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="listItems">
                    {(provided) => (
                      <ul
                        className={styles.list}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {currentList &&
                          currentList.map(
                            ({ image, name, issue_number, issueId }, index) => {
                              return (
                                <Draggable
                                  key={issueId}
                                  draggableId={issueId.toString()}
                                  index={index}
                                >
                                  {(provided) => (
                                    <li
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      ref={provided.innerRef}
                                    >
                                      <IssueItem
                                        imageLink={image}
                                        seriesName={name}
                                        issueNumber={issue_number}
                                        issueId={issueId}
                                        showCheckbox={false}
                                      />
                                    </li>
                                  )}
                                </Draggable>
                              );
                            }
                          )}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
                <button
                  type="button"
                  className={styles.button}
                  onClick={updateOrdering}
                >
                  Update ordering
                </button>
              </>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
