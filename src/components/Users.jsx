import React, { useEffect, useState } from "react";
import { Nav, Navbar, Form } from "react-bootstrap";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import administratorsColumns from "./columns/administratorsColumns";
import teamsColumns from "./columns/teamsColumns";
import {
  addTeam,
  fetchManagers,
  fetchTeams,
  getManagerByUsername,
  updateManager,
} from "../utills/firebaseHelpers";
import { filterSearchObjects } from "../utills/helpers";

export default function Users() {
  const [tab, setTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [managers, setManagers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [processedManagers, setProcessedManagers] = useState([]);

  const [user, setUser] = useState({
    name: "",
    username: "",
    role: "",
    team: "",
  });

  const [team, setTeam] = useState({
    name: "",
    desk: "",
  });

  const handleChangeUser = (e) =>
    setUser((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleChangeTeam = (e) =>
    setTeam((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleChangeManager = (id, key, value) =>
    setProcessedManagers((p) =>
      p.map((m) => (m.id === id ? { ...m, [key]: value } : m))
    );

  const handleSaveManager = async (manager) => {
    const originalManager = managers.find(({ id }) => id === manager.id);
    const unChanged = Object.keys(originalManager).every(
      (key) => originalManager[key] === manager[key]
    );
    if (unChanged) {
      handleChangeManager(manager.id, "isEdit", false);
      return;
    }
    const isUserNameEdited = originalManager.username !== manager.username;
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
    if (!(user.name && user.username && user.role && user.team)) {
      toast.error("Please fill all field");
      return;
    }
    try {
      const formattedDate = new Date().toLocaleDateString("en-US");
      await addDoc(collection(db, "managers"), {
        ...user,
        password: "manager",
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

  const handleAddNewTeam = async () => {
    if (!(team.name && team.desk)) {
      toast.error("Please fill all field");
      return;
    }
    try {
      const res = await addTeam(team);
      console.log("new team res = ", res);
      toast.success("Team added successfully");
      setTeam({
        name: "",
        desk: "",
      });
    } catch (error) {
      toast.error("Error while adding the team");
      console.error("Error while adding the team:", error);
    }
  };

  useEffect(() => {
    setProcessedManagers(managers);
  }, [managers]);

  useEffect(() => {
    const unsubManagers = fetchManagers(setManagers, setLoading);
    const unsubTeams = fetchTeams(setTeams, setLoading);

    return () => {
      unsubManagers();
      unsubTeams();
    };
  }, []);

  const filteredManagers = searchText
    ? filterSearchObjects(searchText, processedManagers)
    : processedManagers;
  const filteredTeams = searchText
    ? filterSearchObjects(searchText, teams)
    : teams;

  const searchOptions = tab === "All" ? administratorsColumns() : teamsColumns;

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
        <div className="input-group input-group-sm w-auto gap-1">
          <select
            className="input-group-text"
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
          >
            <option className="d-none" disabled value="">
              Search By
            </option>
            <option className="dropdown-item" value="All">
              All
            </option>
            {searchOptions.map(({ name }) => (
              <option className="dropdown-item">{name}</option>
            ))}
          </select>
          <input
            className="form-control-sm"
            type="search"
            autoComplete="off"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search.."
          />
        </div>
        <div className="tab-content">
          {tab === "All" && (
            <DataTable
              columns={administratorsColumns({
                handleChangeManager,
                handleSaveManager,
              })}
              data={filteredManagers}
              pagination
              progressPending={loading}
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 20, 50]}
              highlightOnHover
              pointerOnHover
              responsive
            />
          )}
          {tab === "Teams" && (
            <DataTable
              columns={teamsColumns}
              data={filteredTeams}
              pagination
              progressPending={loading}
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
              {teams.map((team, i) => (
                <option key={i} value={team.name}>
                  {team.name}
                </option>
              ))}
            </Form.Select>
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
              value={team.name}
              onChange={handleChangeTeam}
              placeholder="Name"
            />
            <Form.Select
              type="text"
              name="desk"
              value={team.desk}
              placeholder="Desk"
              onChange={handleChangeTeam}
            >
              <option value="" disabled>
                Desk
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
            // onClick={deleteUser}
          >
            Delete
          </button>
          <button
            className="btn btn-secondary"
            id="new-user-add"
            type="button"
            onClick={handleAddNewTeam}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
