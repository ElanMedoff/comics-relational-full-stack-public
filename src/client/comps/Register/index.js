import React, { useContext } from "react";
import classNames from "classnames";
import { BiShow, BiHide } from "react-icons/bi";
import { Redirect, useHistory } from "react-router-dom";
import GlobalStateContext from "client/contexts/globalStateContext";
import myFetch from "client/utilities/myFetch";
import useForm from "client/hooks/useForm";
import styles from "./Register.module.scss";

export default function Register() {
  const globalState = useContext(GlobalStateContext);
  const history = useHistory();
  const {
    username,
    setUsername,
    password,
    setPassword,
    isInputError,
    setIsInputError,
    inputErrorMessage,
    setInputErrorMessage,
    showPassword,
    setShowPassword,
  } = useForm();

  const onSignup = async (e) => {
    e.preventDefault();

    if (!password) {
      setIsInputError(true);
      setInputErrorMessage("A password is required!");
      return;
    }

    const res = await myFetch(
      "POST",
      "http://localhost:3000/api/account/register",
      {
        username,
        password,
      }
    );
    const data = await res.json();

    if (res.status !== 201) {
      console.error("Attempted register", res.status, data.message);
      setIsInputError(true);
      setInputErrorMessage(data.message);
      return;
    }

    console.info(`Registering user: ${username}`, data);
    setUsername("");
    setPassword("");
    history.push("/");
  };

  return (
    <>
      {globalState.username ? (
        <Redirect to="" />
      ) : (
        <div className="width-100 justify-center">
          <div className={styles.formContainer}>
            <form className="relative">
              <h1>Register</h1>
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
                onClick={(e) => onSignup(e)}
              >
                Register
              </button>
              <div
                className={classNames(
                  styles.inputError,
                  isInputError ? styles.inputErrorOpen : styles.inputErrorClosed
                )}
              >
                {isInputError && inputErrorMessage}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
