import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style/styles.css"; // Ensure this is your styles file

const StartScreen = () => {
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLocked(true); // Set to true to close the lock after animation
    }, 500); // Delay before starting the closing animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container">
      <h1 className="lock-header">
        <div className="lock-container">
          <svg
            viewBox="0 0 64 64"
            className={`lock-svg ${isLocked ? "locked" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Lock body */}
            <rect
              x="20"
              y="30"
              width="24"
              height="28"
              rx="4"
              ry="4"
              fill="#4285f4"
            />
            {/* Lock shackle */}
            <path
              d="M32 20c-6.627 0-12 5.373-12 12h4c0-4.418 3.582-8 8-8s8 3.582 8 8h4c0-6.627-5.373-12-12-12z"
              fill="#000"
              className="lock-shackle"
            />
          </svg>
        </div>
        Secure File System
      </h1>
      <p>Save your files easily and with maximum security!</p>
      <div className="button-container">
        <button onClick={() => navigate("/register")}>Register</button>
        <button onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  );
};

export default StartScreen;
