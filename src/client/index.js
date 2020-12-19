import "@babel/polyfill";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Search from "client/comps/Search";
import Nav from "client/comps/Nav";
import Register from "client/comps/Register";
import Lists from "client/comps/Lists";
import Issue from "client/comps/Issue";
import useGlobalState from "client/hooks/useGlobalState";
import GlobalStateContext from "client/contexts/globalStateContext";
import myFetch from "client/utilities/myFetch";
// Order of imports matter for global css
import "client/scss/normalize.scss";
import "client/scss/resets.scss";
import "client/scss/utilities.scss";
import "./index.scss";

function App() {
  const globalState = useGlobalState();

  useEffect(() => {
    const fetchIsLoggedIn = async () => {
      const res = await myFetch(
        "GET",
        "http://localhost:3000/api/account/isLoggedIn"
      );
      const data = await res.json();

      if (res.status !== 200) {
        console.error(`ERROR: ${data.message}`);
      } else {
        console.info("Fetching isLogged in", data);
      }

      if (data.username) {
        globalState.setUsername(data.username);
      }
    };
    const fetchLists = async () => {
      const res = await myFetch(
        "GET",
        "http://localhost:3000/api/account/lists"
      );
      const data = await res.json();

      if (res.status !== 200) {
        console.error(`ERROR: ${data.message}`);
      } else {
        console.info("Fetching user-created lists", data);
      }

      if (data.lists) {
        globalState.setLists(data.lists);
      }
    };

    fetchIsLoggedIn();
    fetchLists();
  }, []);

  return (
    <GlobalStateContext.Provider value={globalState}>
      <Router>
        <Nav />
        <Switch>
          <Route exact path="/">
            <Search />
          </Route>
          <Route path="/lists">
            <Lists />
          </Route>
          <Route path="/issue">
            <Issue />
          </Route>
          <Route path="/register">
            <div>
              <Register />
            </div>
          </Route>
          <Route>
            <div>No match</div>
          </Route>
        </Switch>
      </Router>
    </GlobalStateContext.Provider>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));

/*
TODO

  Make an env file and add the scraper stuff 
  Make some kind of assert so that expired sessions are deleted
*/
