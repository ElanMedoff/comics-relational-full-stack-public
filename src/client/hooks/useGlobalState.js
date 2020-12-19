import { useState } from "react";

export default function useGlobalState() {
  const [username, setUsername] = useState("");
  const [lists, setLists] = useState([]);

  return { username, setUsername, lists, setLists };
}
