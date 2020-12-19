import React from "react";
import propTypes from "prop-types";

export default function CharacterSearch({
  isPrimary,
  setIsPrimary,
  continuity,
  setContinuity,
}) {
  return (
    <div className="sharedSearch--outer">
      <input
        className="sharedSearch--nameInput"
        type="text"
        placeholder="continuity"
        value={continuity}
        onChange={(e) => setContinuity(e.target.value)}
      />
      <div className="flex-row align-center sharedSearch--checkbox">
        <input
          type="checkbox"
          id="isPrimary"
          name="isPrimary"
          checked={isPrimary}
          onChange={(e) => setIsPrimary(e.target.checked)}
        />
        <label htmlFor="isPrimary">Is a primary character in the issue?</label>
      </div>
    </div>
  );
}

CharacterSearch.propTypes = {
  isPrimary: propTypes.bool.isRequired,
  setIsPrimary: propTypes.func.isRequired,
  continuity: propTypes.string.isRequired,
  setContinuity: propTypes.func.isRequired,
};
