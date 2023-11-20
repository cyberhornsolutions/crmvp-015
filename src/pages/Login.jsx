import React from "react";
import logo from "../logo.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div
      className="login_form"
      // action="main-crm.html"
    >
      <div id="logo_wrapper" className="logo_wrapper">
        <img className="logo" src={logo} alt="logo" />
      </div>
      <div id="title">
        <h2>CRM</h2>
      </div>
      <div className="admin_role">
        <input type="radio" value="Admin" name="role" /> <span>Admin</span>
      </div>
      <div className="fields">
        <input
          className="email_input  text-left"
          type="email"
          placeholder="Email"
          name="email"
          required
        />

        <input
          className="psw_input  text-left"
          type="password"
          placeholder="Password"
          name="psw"
          required
        />
      </div>
      <div className="other_roles">
        <div className="other_role">
          <input type="radio" value="Sale" name="role" /> <span>Sale</span>
        </div>
        <div className="other_role">
          <input type="radio" value="Reten" name="role" /> <span>Reten</span>
        </div>
      </div>
      <button className="button" onClick={() => navigate("/home")}>
        Enter
      </button>
    </div>
  );
}
