import React from "react";
import { createRoot } from "react-dom/client";
import './assets/css/index.css'
import "react-swipeable-list/dist/styles.css";

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
