import React from "react";

function LanscapeDecline({ islandScapeInMobile }) {
  return (
    <div>
      <h2
        className={`blank ${islandScapeInMobile ? "landScape" : ""}`}
        style={{ color: "#fff", fontSize: "20px" }}
      >
        Le Society shines brightest when you resist the urge to tilt your device
      </h2>
    </div>
  );
}

export default LanscapeDecline;
