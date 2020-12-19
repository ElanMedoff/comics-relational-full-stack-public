import React, { useEffect, useContext } from "react";
import { BiShow, BiHide } from "react-icons/bi";
import { Link, useHistory } from "react-router-dom";
import classNames from "classnames";
import myFetch from "client/utilities/myFetch";
import useForm from "client/hooks/useForm";
import GlobalStateContext from "client/contexts/globalStateContext";
import styles from "./Login.module.scss";

export default function Register() {
  const globalState = useContext(GlobalStateContext);
  const history = useHistory();

  const {
    username,
    setUsername,
    password,
    setPassword,
    setIsInputError,
    inputErrorMessage,
    setInputErrorMessage,
    showPassword,
    setShowPassword,
  } = useForm();

  const onLogin = async (e) => {
    e.preventDefault();

    if (!password) {
      setInputErrorMessage("A password is required!");
      return;
    }
    const res = await myFetch(
      "POST",
      "http://localhost:3000/api/account/login",
      {
        username,
        password,
      }
    );
    const data = await res.json();

    if (res.status !== 200) {
      console.error(`ERROR: ${data.message}`);
      setInputErrorMessage(data.message);
      setUsername("");
      setPassword("");
      return;
    }
    console.info(`Logging in user: ${username}`, data);

    globalState.setUsername(username);
  };

  useEffect(() => {
    if (inputErrorMessage) {
      alert(inputErrorMessage);
    }
  }, [inputErrorMessage]);

  useEffect(() => {
    if (globalState.username) {
      const fetchLists = async () => {
        try {
          const res = await myFetch("GET", "http://localhost:3000/api/lists");
          const data = await res.json();

          if (res.status !== 200) {
            console.error(`ERROR: ${data.message}`);
          } else {
            console.info("Fetching user-created lists", data);
          }

          globalState.setLists(data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchLists();
    }
  }, [globalState.username]);

  const onLogout = async (e) => {
    e.preventDefault();

    await myFetch("GET", "http://localhost:3000/api/account/logout");

    setUsername("");
    setPassword("");
    globalState.setUsername("");
    history.push("/");
  };

  return (
    <div
      className={classNames(
        styles.formContainer,
        globalState.username ? "justify-end flex-row" : ""
      )}
    >
      {globalState.username ? (
        <button
          className={styles.button}
          onClick={(e) => onLogout(e)}
          type="submit"
        >
          Logout
        </button>
      ) : (
        <>
          <form className="relative">
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => {
                setIsInputError(false);
                setUsername(e.target.value);
              }}
            />
            <div className={styles.passwordContainer}>
              <input
                className={styles.password}
                type={showPassword ? "text" : "password"}
                placeholder="password"
                value={password}
                onChange={(e) => {
                  setIsInputError(false);
                  setPassword(e.target.value);
                }}
              />
              <div
                className={styles.passwordIcon}
                onClick={
                  showPassword
                    ? () => setShowPassword(false)
                    : () => setShowPassword(true)
                }
              >
                {showPassword ? <BiShow /> : <BiHide />}
              </div>
            </div>
            <button
              className={styles.button}
              type="submit"
              onClick={(e) => onLogin(e)}
            >
              Login
            </button>
            {/* <div
          className={classNames(
            styles.inputError,
            isInputError ? styles.inputErrorOpen : styles.inputErrorClosed
          )}
        >
          {isInputError && inputErrorMessage}
        </div> */}
          </form>
          <span className={styles.registerLink}>
            <Link to="/register">Need an account?</Link>
          </span>
        </>
      )}
    </div>
  );
}
