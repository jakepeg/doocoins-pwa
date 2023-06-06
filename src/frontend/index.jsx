import React from "react";
import { createRoot } from "react-dom/client";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import App from "./App";

const root = createRoot(document.getElementById("root"));
serviceWorkerRegistration.register();
root.render(<App />);
