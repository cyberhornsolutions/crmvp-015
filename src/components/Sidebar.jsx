import React from "react";
import accImg from "../acc-img-placeholder.png";
import logo from "../logo.png";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ setTab, tab }) {
  const navigate = useNavigate();

  return (
    <div id="sidebar">
      <div id="logo" onClick={() => setTab("MainBoard")}>
        <img id="logo-img" src={logo} />
      </div>
      <div id="accpic">
        <img src={accImg} id="acc-img" />
        <h5 style={{ fontSize: 16, fontWeight: "bold", lineHeight: 1.1 }}>
          Super Admin
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
          Test Admin
        </h6>
      </div>
      <div id="menuitems">
        <ul id="tab-list">
          <li
            id="menu-dash"
            className={tab === "Dashboard" && "active"}
            onClick={() => {
              setTab("Dashboard");
              navigate("/home");
            }}
          >
            Dashboard
          </li>
          <li
            id="menu-leads"
            className={tab === "Players" && "active"}
            onClick={() => {
              setTab("Players");
              navigate("/home");
            }}
          >
            Players
          </li>
          <li
            id="menu-transactions"
            className={tab === "Transactions" && "active"}
            onClick={() => {
              setTab("Transactions");
              navigate("/home");
            }}
          >
            Transactions
          </li>
          <li
            id="menu-users"
            className={tab === "Managers" && "active"}
            onClick={() => {
              setTab("Managers");
              navigate("/home");
            }}
          >
            Managers
          </li>
          <li
            id="menu-calendar"
            className={tab === "Calendar" && "active"}
            onClick={() => {
              setTab("Calendar");
              navigate("/home");
            }}
          >
            Calendar
          </li>
          <li
            id="menu-affiliates"
            style={{
              marginTop: 30,
              borderTop: "1px solid whitesmoke",
              paddingTop: 25,
            }}
          >
            Affiliates
          </li>
          <li id="menu-news">News</li>
          <li id="menu-platform">
            <a href="https://crm-015.vercel.app/">Game platform</a>
          </li>
        </ul>
      </div>
      <div id="logout">
        <button
          id="logout-button"
          className="transparent-background"
          onClick={() => navigate("/")}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
