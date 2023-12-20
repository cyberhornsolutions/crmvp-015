import React, { useEffect, useState } from "react";
import { Nav, Navbar, Form } from "react-bootstrap";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import administratorsColumns from "./columns/administratorsColumns";
import {
  fetchManagers,
  getManagerByUsername,
  updateManager,
} from "../utills/firebaseHelpers";

export default function Users() {
  const [tab, setTab] = useState("All");
  const [managers, setManagers] = useState([]);
  const [processedManagers, setProcessedManagers] = useState([]);

  const [user, setUser] = useState({
    name: "",
    username: "",
    role: "",
    team: "",
  });

  const handleChangeUser = (e) =>
    setUser((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleChangeManager = (id, key, value) =>
    setProcessedManagers((p) =>
      p.map((m) => (m.id === id ? { ...m, [key]: value } : m))
    );

  const handleEditSave = async (manager) => {
    const isUserNameEdited =
      managers.find(({ id }) => id === manager.id).username !==
      manager.username;
    try {
      if (isUserNameEdited) {
        const alreadyExist = await getManagerByUsername(manager.username);
        if (alreadyExist) {
          toast.error("Username already exist");
          return;
        }
      }
      delete manager.isEdit;
      await updateManager(manager);
      toast.success("Manager updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error updating manager");
    }
  };

  const addUser = async () => {
    try {
      const formattedDate = new Date().toLocaleDateString("en-US");
      await addDoc(collection(db, "managers"), {
        ...user,
        date: formattedDate,
      });
      toast.success("Manager Record Added Successfully.");
      setUser({
        name: "",
        username: "",
        role: "",
        team: "",
      });
    } catch (error) {
      toast.success(error.message);
      console.log("Error While Adding The Manager Record : ", error);
    }
  };

  const deleteUser = () => {
    var table = document.getElementById("users-table");
    var checkboxes = table.querySelectorAll(
      'tbody input[type="checkbox"]:checked'
    );
    checkboxes.forEach(function (checkbox) {
      var row = checkbox.closest("tr");
      row.remove();
    });
  };

  useEffect(() => {
    setProcessedManagers(managers);
  }, [managers]);

  useEffect(() => {
    return fetchManagers(setManagers);
  }, []);

  return (
    <div id="users" className="active">
      <div
        id="users-div"
        // className="hidden"
      >
        <Navbar className="nav nav-tabs p-0">
          <Nav className="me-auto" style={{ gap: "2px" }}>
            <Nav.Link
              className={tab === "All" && "active"}
              onClick={() => setTab("All")}
            >
              All
            </Nav.Link>
            <Nav.Link
              className={tab === "Teams" && "active"}
              onClick={() => setTab("Teams")}
            >
              Teams
            </Nav.Link>
          </Nav>
        </Navbar>
        <div
          className="dropdown"
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: 10,
            // height: 25,
          }}
        >
          <select className="btn dropdown-toggle">
            <option
              className="dropdown-item text-left"
              style={{ display: "none" }}
            >
              Search
            </option>
            <option className="dropdown-item text-left">By name</option>
            <option className="dropdown-item text-left">By email</option>
            <option className="dropdown-item text-left">By position</option>
            <option className="dropdown-item text-left">By desk</option>
          </select>
          <input
            type="text"
            id="usersSearchInput"
            onkeyup="usersSearch()"
            placeholder="Поиск.."
          />
        </div>
        <div className="tab-content">
          {tab === "All" && (
            <DataTable
              columns={administratorsColumns({
                handleChangeManager,
                handleEditSave,
              })}
              data={processedManagers}
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 20, 50]}
              highlightOnHover
              pointerOnHover
              responsive
            />
          )}
          {tab === "Teams" && (
            <DataTable
              columns={administratorsColumns({ isEdit })}
              data={[]}
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 20, 50]}
              highlightOnHover
              pointerOnHover
              responsive
            />
          )}
        </div>
      </div>
      <div
        id="newUser-form"
        // className="hidden"
      >
        <h5>Manage</h5>
        <form id="addNewUser">
          <div id="new-user-fields" className="d-flex gap-1">
            <Form.Control
              type="text"
              name="name"
              value={user.name}
              onChange={handleChangeUser}
              placeholder="Name"
            />
            <Form.Control
              type="text"
              name="username"
              value={user.username}
              onChange={handleChangeUser}
              placeholder="Username"
            />

            <Form.Select
              type="text"
              name="role"
              value={user.role}
              placeholder="Role"
              onChange={handleChangeUser}
            >
              <option value="" disabled>
                Role
              </option>
              <option value="Sale">Sale</option>
              <option value="Reten">Reten</option>
            </Form.Select>
            <Form.Select
              type="text"
              name="team"
              value={user.team}
              placeholder="Team"
              onChange={handleChangeUser}
            >
              <option value="" disabled>
                Team
              </option>
              <option value="Main">Main</option>
              <option value="Demo">Demo</option>
            </Form.Select>
          </div>
        </form>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            id="new-user-del"
            type="button"
            onClick={deleteUser}
          >
            Delete
          </button>
          <button
            className="btn btn-secondary"
            id="new-user-add"
            type="button"
            onClick={addUser}
          >
            Add
          </button>
        </div>
      </div>
      <div id="newUser-form">
        <h5>Team</h5>
        <form id="addNewUser">
          <div id="new-user-fields" className="d-flex gap-1">
            <Form.Control
              type="text"
              name="name"
              value={user.name}
              onChange={handleChangeUser}
              placeholder="Name"
            />
            <Form.Control
              type="text"
              name="team"
              value={user.team}
              onChange={handleChangeUser}
              placeholder="Team"
            />
          </div>
        </form>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            id="new-user-del"
            type="button"
            // onClick={deleteUser}
          >
            Delete
          </button>
          <button
            className="btn btn-secondary"
            id="new-user-add"
            type="button"
            // onClick={addUser}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
