import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.log("DETECTED")
let container = document.createElement("div");
container.className = "fullsz"
const root = createRoot(
  document.getElementById('root').appendChild(container)
);
root.render(<App />);
