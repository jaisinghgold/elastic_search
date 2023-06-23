import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "@elastic/eui/dist/eui_theme_light.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
