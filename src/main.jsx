import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { initCursor } from "./fx/cursor.js";
import { initF1 } from "./fx/f1.js";
import "./styles.css";

initCursor();
initF1();

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
