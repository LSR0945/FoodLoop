import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createMemoryHistory, createHashHistory } from "@tanstack/react-router";
import { getRouter } from "./src/router";
import "./src/styles.css";

// Use hash history for Capacitor WebView so file:/// or local scheme routes map directly to paths
const history = createHashHistory();
const router = getRouter();
router.update({ history });

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

