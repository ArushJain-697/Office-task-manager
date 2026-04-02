import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FrontPageTerminal from "./components/FrontPageTerminal";
import Newspaper from "./components/Newspaper";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FrontPageTerminal /> 
    {/* <Newspaper /> */}
  </StrictMode>,
);
