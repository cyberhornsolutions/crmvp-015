import React, { useState } from "react";
import logo from "../logo.png";
import { useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role");
    } else if (role !== "Admin") {
      toast.error("Sale or Reten Manager does not exist yet.");
    } else if (user.username === "admin" && user.password === "admin") {
      navigate("/home");
    } else {
      toast.error("Username or password is incorrect");
    }
  };

  const handleChange = (e) =>
    setUser((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div
      className="d-flex align-items-center"
      style={{
        height: "100vh",
      }}
    >
      <ToastContainer />
      <Form
        onSubmit={handleSubmit}
        className="d-flex flex-column align-items-center mx-auto login_form"
      >
        <div id="logo_wrapper" className="logo_wrapper">
          <img className="logo" src={logo} alt="logo" />
        </div>
        <div id="title">
          <h2>CRM</h2>
        </div>
        <Form.Check
          type="radio"
          label="Admin"
          id="admin_role"
          className="text-light"
          checked={role === "Admin"}
          onChange={() => setRole("Admin")}
        />
        <div className="w-75">
          <input
            className="email_input text-left"
            type="text"
            placeholder="Username"
            value={user.username}
            name="username"
            required
            onChange={handleChange}
          />

          <input
            className="psw_input text-left"
            type="password"
            placeholder="Password"
            value={user.password}
            name="password"
            required
            onChange={handleChange}
          />
        </div>
        <div className="row mt-4">
          <div className="col">
            <Form.Check
              type="radio"
              label="Sale"
              id="sale_role"
              className="text-light"
              checked={role === "Sale"}
              onChange={() => setRole("Sale")}
            />
          </div>
          <div className="col">
            <Form.Check
              type="radio"
              label="Reten"
              id="Reten_role"
              className="text-light"
              checked={role === "Reten"}
              onChange={() => setRole("Reten")}
            />
          </div>
        </div>
        <button className="button" type="submit">
          Enter
        </button>
      </Form>
    </div>
  );
}
