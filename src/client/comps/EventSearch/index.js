import React from "react";
import propTypes from "prop-types";

export default function EventSearch({
  isCurrent,
  setIsCurrent,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <div className="sharedSearch--outer">
      <div className="flex-row align-center sharedSearch--checkbox">
        <input
          type="checkbox"
          id="isCurrent"
          name="isCurrent"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.target.checked)}
        />
        <label htmlFor="isCurrent">Is the event current?</label>
      </div>
      <div className="flex-column">
        <span style={{ fontSize: "18px" }}>Event date range</span>
        <div className="flex-row align-center">
          <input
            type="date"
            className="sharedSearch--dateInput"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-row align-center">
          <input
            type="date"
            className="sharedSearch--dateInput"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

EventSearch.propTypes = {
  isCurrent: propTypes.bool.isRequired,
  setIsCurrent: propTypes.func.isRequired,
  startDate: propTypes.string.isRequired,
  setStartDate: propTypes.func.isRequired,
  endDate: propTypes.string.isRequired,
  setEndDate: propTypes.func.isRequired,
};
