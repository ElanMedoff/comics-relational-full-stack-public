/* eslint-disable camelcase */
import React, { useState, useEffect, useContext } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import GlobalStateContext from "client/contexts/globalStateContext";
import SeriesSearch from "client/comps/SeriesSearch";
import CreatorSearch from "client/comps/CreatorSearch";
import EventSearch from "client/comps/EventSearch";
import IssueItem from "client/comps/IssueItem";
import SearchLists from "client/comps/SearchLists";
import useSeriesSearch from "client/hooks/useSeriesSearch";
import useEventSearch from "client/hooks/useEventSearch";
import myFetch from "client/utilities/myFetch";
import styles from "./Search.module.scss";

export default function Search() {
  const globalState = useContext(GlobalStateContext);

  const [issueItems, setIssueItems] = useState([]);
  const [issuesToAdd, setIssuesToAdd] = useState([]);
  const [haveIssuesAdded, setHaveIssuesAdded] = useState(false);

  const [barInput, setBarInput] = useState("");
  const [barPlaceholder, setBarPlaceholder] = useState("");

  const [
    isSeriesCurrent,
    setIsSeriesCurrent,
    coverPrice,
    setCoverPrice,
    seriesStartDate,
    setSeriesStartDate,
    seriesEndDate,
    setSeriesEndDate,
    issueStartDate,
    setIssueStartDate,
    issueEndDate,
    setIssueEndDate,
  ] = useSeriesSearch();

  const [
    isEventCurrent,
    setIsEventCurrent,
    eventStartDate,
    setEventStartDate,
    eventEndDate,
    setEventEndDate,
  ] = useEventSearch();

  const [role, setRole] = useState("");

  const [tabIndex, setTabIndex] = useState(0);
  const indexToContent = ["series", "character", "creator", "event"];

  useEffect(() => {
    setBarPlaceholder(
      `search for your favorite issues by ${indexToContent[tabIndex]} name!`
    );
  }, [tabIndex]);

  const setFetchData = () => {
    const data = {};
    data.barInput = barInput;

    switch (indexToContent[tabIndex]) {
      case "character":
        return data;
      case "creator":
        data.role = role;
        return data;
      case "series":
        data.isSeriesCurrent = isSeriesCurrent;
        data.coverPrice = coverPrice;
        data.seriesStartDate = seriesStartDate;
        data.seriesEndDate = seriesEndDate;
        data.issueStartDate = issueStartDate;
        data.issueEndDate = issueEndDate;
        return data;
      case "event":
        data.isEventCurrent = isEventCurrent;
        data.eventStartDate = eventStartDate;
        data.eventEndDate = eventEndDate;
        return data;
      default:
        throw new Error("Bad switch case!");
    }
  };

  useEffect(() => {
    if (barInput && barInput !== " ") {
      const fetchIssues = async () => {
        const res = await myFetch(
          "POST",
          `http://localhost:3000/api/${indexToContent[tabIndex]}`,
          setFetchData()
        );
        const data = await res.json();

        if (res.status !== 200) {
          console.error(`ERROR: ${data.message}`);
        } else {
          console.info("Fetching issues", data);
        }

        setIssueItems(data);
      };

      fetchIssues();
    } else {
      setIssueItems([]);
    }
  }, [
    barInput,
    role,
    isSeriesCurrent,
    coverPrice,
    seriesStartDate,
    seriesEndDate,
    issueStartDate,
    issueEndDate,
    isEventCurrent,
    eventStartDate,
    eventEndDate,
  ]);

  const addIssuesToList = async (selectedLists) => {
    for (const listId of selectedLists) {
      const issuesRanked = issuesToAdd.reduce((accum, curr, index) => {
        return [...accum].concat([{ issueId: curr, rank: index + 1 }]);
      }, []);
      const res = await myFetch(
        "POST",
        "http://localhost:3000/api/lists/append",
        {
          listId,
          issuesRanked,
        }
      );
      const data = await res.json();

      if (res.status !== 200) {
        console.error(`ERROR: ${data.message}`);
      } else {
        console.info(`Appending issues to list: ${listId}`, data);
      }

      globalState.setLists((prev) => {
        return prev.map((curr) => {
          if (curr.listId === listId) {
            return {
              ...curr,
              list: data,
            };
          }

          return { ...curr };
        });
      });
    }
    alert("Issues added to list!");
  };

  return (
    <div className={styles.SearchListsAndSearch}>
      <SearchLists
        addIssuesToList={addIssuesToList}
        setHaveIssuesAdded={setHaveIssuesAdded}
        haveIssuesAdded={haveIssuesAdded}
      />
      <div className={styles.entireWrapper}>
        <div className={styles.searchWrapper}>
          <div className={styles.advancedWrapper}>
            <Tabs
              selectedIndex={tabIndex}
              onSelect={(index) => setTabIndex(index)}
            >
              <TabList>
                <Tab>series</Tab>
                <Tab>character</Tab>
                <Tab>creator</Tab>
                <Tab>event</Tab>
              </TabList>

              <div className={styles.tabPanelWrapper}>
                <TabPanel>
                  <SeriesSearch
                    isCurrent={isSeriesCurrent}
                    setIsCurrent={setIsSeriesCurrent}
                    coverPrice={coverPrice}
                    setCoverPrice={setCoverPrice}
                    seriesStartDate={seriesStartDate}
                    setSeriesStartDate={setSeriesStartDate}
                    seriesEndDate={seriesEndDate}
                    setSeriesEndDate={setSeriesEndDate}
                    issueStartDate={issueStartDate}
                    setIssueStartDate={setIssueStartDate}
                    issueEndDate={issueEndDate}
                    setIssueEndDate={setIssueEndDate}
                  />
                </TabPanel>
                <TabPanel />
                <TabPanel>
                  <CreatorSearch role={role} setRole={setRole} />
                </TabPanel>
                <TabPanel>
                  <EventSearch
                    isCurrent={isEventCurrent}
                    setIsCurrent={setIsEventCurrent}
                    startDate={eventStartDate}
                    setStartDate={setEventStartDate}
                    endDate={eventEndDate}
                    setEndDate={setEventEndDate}
                  />
                </TabPanel>
              </div>
            </Tabs>
          </div>
          <input
            type="text"
            placeholder={barPlaceholder}
            className={styles.searchBar}
            value={barInput}
            onChange={(e) => {
              setBarInput(e.target.value);
            }}
          />
        </div>
        <div className="width-100">
          {issueItems &&
            issueItems.map(({ image, name, issue_number, id }, index) => {
              return (
                <React.Fragment key={index}>
                  <IssueItem
                    imageLink={image}
                    seriesName={name}
                    issueNumber={issue_number}
                    issueId={id}
                    setIssuesToAdd={setIssuesToAdd}
                    haveIssuesAdded={haveIssuesAdded}
                    showCheckbox
                  />
                </React.Fragment>
              );
            })}
        </div>
      </div>
    </div>
  );
}
