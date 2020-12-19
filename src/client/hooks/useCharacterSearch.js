import { useState } from "react";

export default function useCharacterSearch() {
  const [isPrimary, setIsPrimary] = useState(false);
  const [continuity, setContinuity] = useState("");

  return [isPrimary, setIsPrimary, continuity, setContinuity];
}
