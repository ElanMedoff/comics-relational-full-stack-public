/* eslint-disable react/prop-types */
import React from "react";
import classNames from "classnames";

export default function SeriesSearch({
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
}) {
  return (
    <div className="sharedSearch--outer">
      <input
        className="sharedSearch--nameInput"
        type="number"
        placeholder="price"
        value={coverPrice}
        onChange={(e) => setCoverPrice(e.target.value)}
        style={{ width: "100px" }}
      />
      <div className="flex-row align-center sharedSearch--checkbox">
        <input
          type="checkbox"
          id="isCurrent"
          name="isCurrent"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.target.checked)}
        />
        <label htmlFor="isCurrent">Is the series current?</label>
      </div>
      <div className="flex-column">
        <span style={{ fontSize: "18px" }}>Series date range</span>
        <div className="flex-row align-center">
          <input
            type="number"
            placeholder="start year"
            className="sharedSearch--dateInput"
            value={seriesStartDate}
            onChange={(e) => setSeriesStartDate(e.target.value)}
          />
        </div>
        <div className="flex-row align-center">
          <input
            type="number"
            placeholder="end year"
            className="sharedSearch--dateInput"
            value={seriesEndDate}
            onChange={(e) => setSeriesEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-column">
        <span style={{ fontSize: "18px" }}>Issue date range</span>

        <div className="flex-row align-center">
          <input
            type="date"
            className="sharedSearch--dateInput"
            value={issueStartDate}
            onChange={(e) => setIssueStartDate(e.target.value)}
          />
        </div>
        <div className="flex-row align-center">
          <input
            type="date"
            className="sharedSearch--dateInput"
            value={issueEndDate}
            onChange={(e) => setIssueEndDate(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
