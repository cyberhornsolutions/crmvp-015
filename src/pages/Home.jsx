import React, { useState } from "react";
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

export default function Home() {
  const [tab, setTab] = useState("Dashboard");
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
          {tab === "Managers" && <Users />}
          {tab === "Symbols" && <Symbols />}
          {tab === "Calendar" && <Calendar />}
          {tab === "MainBoard" && <MainBoard />}
        </div>
      </div>
    </div>
  );
}
