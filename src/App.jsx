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
import { useSelector } from "react-redux";

const App = () => {
  const { isLogin } = useSelector((state) => state.user);
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/" Component={Login} />
      </Route>
    )
  );
  const protectedRouter = createBrowserRouter(
    createRoutesFromElements(<Route path="/" Component={Home} />)
  );

  return <RouterProvider router={isLogin ? protectedRouter : router} />;
};

export default App;
