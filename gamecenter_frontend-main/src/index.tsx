import ReactDOM from "react-dom/client";

import "@fontsource-variable/onest";
import "@fontsource-variable/unbounded";

import brandLogo from "./shared/assets/brand/logo-ic26.svg";
import { ErrorBoundary } from "./shared/ui/error-boundary";

import "./index.css";
import App from "./App";

const favicon =
  document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
  document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/svg+xml";
favicon.href = brandLogo;
if (!favicon.isConnected) {
  document.head.appendChild(favicon);
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  // <React.StrictMode>
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  // </React.StrictMode>,
);
