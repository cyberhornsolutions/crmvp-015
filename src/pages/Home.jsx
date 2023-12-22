import React, { useEffect, useState } from "react";
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
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useDispatch } from "react-redux";
import { setSymbolsState } from "../redux/slicer/symbolsSlicer";

export default function Home() {
  const [tab, setTab] = useState("Dashboard");
  const dispatch = useDispatch();

  const getAllSymbols = () => {
    const symbolsRef = collection(db, "symbols");

    const unsubscribe = onSnapshot(
      symbolsRef,
      (snapshot) => {
        const symbolsData = [];
        snapshot.forEach((doc) => {
          symbolsData.push({ id: doc.id, ...doc.data() });
        });

        dispatch(setSymbolsState(symbolsData));
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
    return () => unsubscribe();
  };

  useEffect(() => {
    return getAllSymbols();
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
          {tab === "Symbols" && <Symbols />}
          {tab === "Affiliates" && <Symbols />}
          {tab === "Calendar" && <Calendar />}
          {tab === "Administrator" && <Users />}
          {tab === "MainBoard" && <MainBoard />}
        </div>
      </div>
    </div>
  );
}
