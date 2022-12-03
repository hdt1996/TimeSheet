import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(
  document.body.appendChild(document.getElementById('root'))
);
root.render(<App />);