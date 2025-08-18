import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Get Hired</h1>
      <p className="text-gray-700">
        Welcome! We'll guide you through the hiring flow step by step.
      </p>
      <Link
        to="/get-hired/start"
        className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-yellow hover:opacity-90"
      >
        Start hiring setup
      </Link>
    </div>
  );
}
