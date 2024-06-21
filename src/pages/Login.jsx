import React, { useState } from "react";
import logo from "../logo.png";
import { Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import {
  getBlockedIPs,
  getManagerByUsernameAndRole,
  updateManager,
} from "../utills/firebaseHelpers";
import { getIPRange } from "../utills/helpers";
import { serverTimestamp } from "firebase/firestore";

export default function Login() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!role) return toast.error("Please select a role");
      setLoading(true);
      const manager = await getManagerByUsernameAndRole(user.username, role);
      if (!manager) toast.error("User not found");
      else if (!manager.isActive) toast.error("User is disabled");
      else if (user.password !== manager.password)
        toast.error("Username or password is incorrect");
      else {
        let ipAddress;
        if (manager.id === "5nmfLtd8AdH4k9GPLNvQ") {
          ipAddress = await fetch("https://api.ipify.org").then((res) =>
            res.text()
          );
        } else {
          const [ip, blockedIps] = await Promise.all([
            fetch("https://api.ipify.org").then((res) => res.text()),
            getBlockedIPs(),
          ]);
          for (let { firstIp, secondIp } of blockedIps) {
            if (ip === firstIp || ip === secondIp)
              return toast.error("You are blocked to login");
            const ipRange = getIPRange(firstIp, secondIp);
            if (ipRange.includes(ip))
              return toast.error("You are blocked to login");
          }
          ipAddress = ip;
        }
        console.log("ip ====> ", ipAddress);
        await updateManager(manager.id, {
          onlineStatus: true,
          lastActive: serverTimestamp(),
          ip: ipAddress,
        });
        localStorage.setItem("USER", JSON.stringify(manager));
        location.href = "/";
      }
      setLoading(false);
    } catch (error) {
      console.log("Error while login", error);
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
