import { createRoot } from "react-dom/client";
import PublicDirectory from "./PublicDirectory";
import "./index.css";

createRoot(document.getElementById("root")!).render(<PublicDirectory />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(console.warn);
  });
}
