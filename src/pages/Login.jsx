import React, { useState } from "react";
import logo from "../logo.png";
import { Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { getManagerByUsernameAndRole } from "../utills/firebaseHelpers";

export default function Login() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) return toast.error("Please select a role");
    setLoading(true);
    const manager = await getManagerByUsernameAndRole(user.username, role);
    if (!manager) {
      toast.error("User not found");
      setLoading(false);
    } else if (!manager.isActive) {
      toast.error("User is disabled");
      setLoading(false);
      // } else if (manager.password !== user.password) {
    } else if (user.password !== role.toLowerCase()) {
      toast.error("Username or password is incorrect");
      setLoading(false);
    } else {
      localStorage.setItem("USER", JSON.stringify(manager));
      location.href = "/";
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
        <button className="button" type="submit" disabled={loading}>
          Enter
        </button>
      </Form>
    </div>
  );
}
