import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="landing-page">
      <div className="landing-content">
        {/* Welcome to */}
        <p className="landing-welcome">Welcome to</p>
        
        {/* Zform Logo */}
        <div className="landing-logo">
          <span className="landing-logo-text">
            <span className="zform-teal">Z</span>
            <span className="zform-golden">form</span>
          </span>
        </div>
        
        {/* Internal Tool */}
        <p className="landing-subtitle">Internal Tool</p>
        
        {/* Tagline */}
        <p className="landing-tagline">Get Hired/ Paid</p>
        
        {/* Get Started Button */}
        <Link to="/login" className="landing-button">
          Get Started
        </Link>
      </div>
    </div>
  );
}
