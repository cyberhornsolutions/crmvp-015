import React from "react";
// import "./App.css";
import Login from "./pages/Login.jsx";
import "./style-crm.css";
import "./main.css";

// import "./index.css";

import {
  Route,
  BrowserRouter as Router,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import MainBoard from "./components/MainBoard.jsx";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" Component={Login} index />
        <Route path="/home" Component={Home} />
        <Route path="/home/mainBoard" Component={MainBoard} />
      </>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;