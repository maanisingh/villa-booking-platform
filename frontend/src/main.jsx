import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // ✅ Add this line
import "./index.css";
import App from "./App.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>  {/* ✅ Wrap App inside BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
