import { useState } from "react";

export default function useEventSearch() {
  const [isCurrent, setIsCurrent] = useState(false);
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");

  return [
    isCurrent,
    setIsCurrent,
    eventStartDate,
    setEventStartDate,
    eventEndDate,
    setEventEndDate,
  ];
}
