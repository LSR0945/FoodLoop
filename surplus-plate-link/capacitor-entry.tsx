import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashHistory } from "@tanstack/react-router";
import { getRouter } from "./src/router";
import "./src/styles.css";

// Ensure initial hash route exists
if (!window.location.hash || window.location.hash === "#" || window.location.hash === "") {
  window.location.hash = "#/";
}

const rootEl = document.getElementById("root");

async function mount() {
  if (!rootEl) {
    console.error("FoodLoop: #root element not found");
    return;
  }
  try {
    const history = createHashHistory();
    const router = getRouter();
    router.update({ history });

    createRoot(rootEl).render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  } catch (err: any) {
    console.error("FoodLoop mount error:", err);
    rootEl.innerHTML = `<div style="padding: 24px; font-family: 'Manrope', sans-serif; color: #242923; background: #F8F5ED; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
      <img src="./foodloop-logo.png" alt="FoodLoop" style="width: 80px; height: 80px; margin-bottom: 16px;" />
      <h2 style="margin: 0 0 8px; font-size: 20px;">FoodLoop</h2>
      <p style="margin: 0; color: #656C62; font-size: 14px;">Loading error: ${err?.message || String(err)}</p>
      <button onclick="location.reload()" style="margin-top: 16px; padding: 10px 24px; background: #205C43; color: white; border: none; border-radius: 999px; font-weight: 700; cursor: pointer;">Retry</button>
    </div>`;
  }
}

mount();
