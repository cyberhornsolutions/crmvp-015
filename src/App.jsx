import React from "react";
// import "./App.css";
import Login from "./pages/Login.jsx";
import "./style-crm.css";
import "./main.css";

// import "./index.css";

import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/" Component={Login} />
        <Route path="/home" Component={Home} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
