// ⭐ FIX for SockJS in Vite:
window.global = window;

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// //You need @stomp/stompjs and sockjs-client.
// npm install @stomp/stompjs sockjs-client



// //You need @stomp/stompjs and sockjs-client.

// Install:

// npm install @stomp/stompjs sockjs-client
// # or
// yarn add @stomp/stompjs sockjs-client