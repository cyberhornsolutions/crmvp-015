import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import Header from "../components/Header";
import Leads from "../components/Leads";
import Transactions from "../components/Transactions";
import Users from "../components/Users";
import Calendar from "../components/Calendar";
import MainBoard from "../components/MainBoard";
import Symbols from "../components/Symbols";
import { ToastContainer } from "react-toastify";
import { getAllDeposits } from "../utills/firebaseHelpers";
import { setDepositsState } from "../redux/slicer/transactionSlicer";
import { useDispatch } from "react-redux";

export default function Home() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("Dashboard");

  const setDeposits = useCallback((data) => {
    dispatch(setDepositsState(data));
  }, []);

  useEffect(() => {
    getAllDeposits(setDeposits);
  }, []);

  return (
    <div id="content">
      <ToastContainer />

      <Sidebar tab={tab} setTab={setTab} />
      <div id="main">
        <Header title={tab} />
        <div className="tab-content">
          {tab === "Dashboard" && <Dashboard />}
          {tab === "Players" && <Leads setTab={setTab} />}
          {tab === "Transactions" && <Transactions />}
          {tab === "Assets" && <Symbols />}
          {tab === "Calendar" && <Calendar />}
          {tab === "Administrator" && <Users />}
          {tab === "Player Card" && <MainBoard />}
        </div>
      </div>
    </div>
  );
}
