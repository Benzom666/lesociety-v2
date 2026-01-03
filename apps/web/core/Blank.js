import React, { useState, useEffect } from "react";

function Blank() {
  const [screenSize, setScreenSize] = useState(getCurrentDimension());

  function getCurrentDimension() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  useEffect(() => {
    const updateDimension = () => {
      setScreenSize(getCurrentDimension());
    };
    window.addEventListener("resize", updateDimension);
    return () => {
      window.removeEventListener("resize", updateDimension);
    };
  }, [screenSize]);

  const islandScapeInMobile =
    screenSize.width < 1181 && screenSize.width > screenSize.height;
  console.log(screenSize, islandScapeInMobile);
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

export default Blank;
