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
import {
  fetchTeams,
  fetchManagers,
  fetchOrders,
  fetchPlayers,
  getAllDeposits,
  getColumnsById,
  getCommentsByManager,
} from "../utills/firebaseHelpers";
import { setOrdersState } from "../redux/slicer/orderSlicer";
import { setDepositsState } from "../redux/slicer/transactionSlicer";
import { setColumnsState } from "../redux/slicer/columnsSlicer";
import { useSelector, useDispatch } from "react-redux";
import { setPlayersState } from "../redux/slicer/playersSlicer";
import { setManagersState } from "../redux/slicer/managersSlice";
import { setTeamsState } from "../redux/slicer/teamsSlice";
import { setCommentsState } from "../redux/slicer/commentsSlicer";

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [tab, setTab] = useState(
    () => localStorage.getItem("TAB") || "Dashboard"
  );

  useEffect(() => {
    localStorage.setItem("TAB", tab);
  }, [tab]);

  const setOrders = useCallback((orders) => {
    dispatch(setOrdersState(orders));
  }, []);
  const setDeposits = useCallback((data) => {
    dispatch(setDepositsState(data));
  }, []);
  const setColumns = useCallback((data) => {
    dispatch(setColumnsState(data));
  }, []);
  const setPlayers = useCallback((players) => {
    if (user.role !== "Admin")
      players = players.filter(({ manager }) => manager === user.id);
    dispatch(setPlayersState(players));
    fetchOrders(
      setOrders,
      players.map((p) => p.id)
    );
  }, []);
  const setManagers = useCallback((data) => {
    dispatch(setManagersState(data));
  }, []);
  const setTeams = useCallback((data) => {
    dispatch(setTeamsState(data));
  }, []);

  const setComments = useCallback((data) => {
    dispatch(setCommentsState(data));
  }, []);

  useEffect(() => {
    const unsubDeposits = getAllDeposits(setDeposits);
    const unsubColumns = getColumnsById(user.id, setColumns);
    const unsubPlayers = fetchPlayers(setPlayers);
    const unsubMangers = fetchManagers(setManagers);
    const unsubTeams = fetchTeams(setTeams);
    const unsubComments = getCommentsByManager(user.id, setComments);

    return () => {
      unsubDeposits();
      unsubColumns();
      unsubPlayers();
      unsubMangers();
      unsubTeams();
      unsubComments();
    };
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
