import React from "react";
import accImg from "../acc-img-placeholder.png";
import logo from "../logo.png";
import { useSelector } from "react-redux";

export default function Sidebar({ setTab, tab }) {
  const { user } = useSelector((state) => state.user);
  return (
    <div id="sidebar">
      <div id="logo" onClick={() => setTab("MainBoard")}>
        <img id="logo-img" src={logo} />
      </div>
      <div id="accpic">
        <img src={accImg} id="acc-img" />
        <h5 style={{ fontSize: 16, fontWeight: "bold", lineHeight: 1.1 }}>
          {user.role}
        </h5>
        <h6
          style={{
            color: "gray",
            borderTop: "1px solid whitesmoke",
            marginTop: 10,
            marginBottom: 10,
            paddingTop: 12,
            fontSize: 14,
            lineHeight: 1.1,
          }}
        >
          {user.username}
        </h6>
      </div>
      <div id="menuitems">
        <ul id="tab-list">
          <li
            id="menu-dash"
            className={tab === "Dashboard" && "active"}
            onClick={() => {
              setTab("Dashboard");
            }}
          >
            Dashboard
          </li>
          <li
            id="menu-leads"
            className={tab === "Players" && "active"}
            onClick={() => {
              setTab("Players");
            }}
          >
            Players
          </li>
          {user.role === "Admin" && (
            <li
              id="menu-transactions"
              className={tab === "Transactions" && "active"}
              onClick={() => {
                setTab("Transactions");
              }}
            >
              Transactions
            </li>
          )}
          {user.role !== "Sale" && (
            <li
              id="menu-users"
              className={tab === "Assets" && "active"}
              onClick={() => {
                setTab("Assets");
              }}
            >
              Assets
            </li>
          )}
          <li
            id="menu-calendar"
            className={tab === "Calendar" && "active"}
            onClick={() => {
              setTab("Calendar");
            }}
          >
            Calendar
          </li>
          {user.role === "Admin" && (
            <li
              id="menu-users"
              className={tab === "Administrator" && "active"}
              onClick={() => {
                setTab("Administrator");
              }}
            >
              Administrator
            </li>
          )}
          <hr />
          <li id="menu-platform">
            <a href="https://crm-015.vercel.app/">Game platform</a>
          </li>
        </ul>
      </div>
      <div id="logout">
        <button
          id="logout-button"
          className="transparent-background"
          onClick={() => {
            localStorage.clear();
            location.href = "/";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
