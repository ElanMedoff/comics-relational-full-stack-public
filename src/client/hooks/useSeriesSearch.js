import { useState } from "react";

export default function useSeriesSearch() {
  const [isCurrent, setIsCurrent] = useState(false);
  const [coverPrice, setCoverPrice] = useState();
  const [seriesStartDate, setSeriesStartDate] = useState("");
  const [seriesEndDate, setSeriesEndDate] = useState("");
  const [issueStartDate, setIssueStartDate] = useState("");
  const [issueEndDate, setIssueEndDate] = useState("");

  return [
    isCurrent,
    setIsCurrent,
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
  ];
}
