import React from "react";
import propTypes from "prop-types";

export default function CreatorSearch({ role, setRole }) {
  return (
    <div className="sharedSearch--outer">
      <input
        className="sharedSearch--nameInput"
        type="text"
        placeholder="role (penciler, artist, etc.)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
    </div>
  );
}

CreatorSearch.propTypes = {
  role: propTypes.string,
  setRole: propTypes.func.isRequired,
};
