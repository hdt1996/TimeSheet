import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.log("DETECTED")
const root = createRoot(
  document.getElementById('root').appendChild(document.createElement("div"))
);
root.render(<App />);
