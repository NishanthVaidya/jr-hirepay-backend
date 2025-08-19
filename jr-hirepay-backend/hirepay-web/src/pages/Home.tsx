import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="zforms">
      <div className="zforms__landing">
        <div className="zforms__landing-content">
          {/* Welcome to */}
          <p className="zforms__landing-welcome">Welcome to</p>
          
          {/* Zform Logo */}
          <div className="zforms__landing-logo">
            <span className="zforms__landing-logo-text">
              <span className="zforms__landing-logo-accent">Z</span>
              <span className="zforms__landing-logo-main">form</span>
            </span>
          </div>
          
          {/* Internal Tool */}
          <p className="zforms__landing-subtitle">Internal Tool</p>
          
          {/* Tagline */}
          <p className="zforms__landing-tagline">Get Hired/ Paid</p>
          
          {/* Get Started Button */}
          <Link to="/login" className="zforms__landing-button">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
