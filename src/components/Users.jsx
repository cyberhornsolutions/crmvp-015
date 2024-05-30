import React, { useEffect, useState, useCallback } from "react";
import { Nav, Navbar, Form } from "react-bootstrap";
import { auth, db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import administratorsColumns from "./columns/administratorsColumns";
import ipMonitorsColumns from "./columns/ipMonitorColumns";
import teamsColumns from "./columns/teamsColumns";
import {
  addTeam,
  fetchManagers,
  fetchBlockedIps,
  fetchTeams,
  getManagerByUsername,
  updateManager,
  updateBlockedIp,
  addBlockedIp,
} from "../utills/firebaseHelpers";
import { fillArrayWithEmptyRows, filterSearchObjects } from "../utills/helpers";
import { useDispatch, useSelector } from "react-redux";
import { setManagersState } from "../redux/slicer/managersSlice";
import { setTeamsState } from "../redux/slicer/teamsSlice";
import { setIpsState } from "../redux/slicer/ipsSlicer";

export default function Users() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("IP Monitor");
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const managers = useSelector((state) => state.managers);
  const teams = useSelector((state) => state.teams);
  const players = useSelector((state) => state.players);
  const ips = useSelector((state) => state.ips);

  const playersOnlineCount = players.filter((el) => el.onlineStatus).length;
  const managersOnlineCount = managers.filter((m) => m.onlineStatus).length;
  const totalManagersActive = managers.filter((m) => m.isActive).length;

  const [processedManagers, setProcessedManagers] = useState([]);
  const [processedIps, setProcessedIps] = useState([]);

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

  const setManagers = useCallback((data) => {
    dispatch(setManagersState(data));
  }, []);

  const setTeams = useCallback((data) => {
    dispatch(setTeamsState(data));
  }, []);

  const setIps = useCallback((data) => {
    if (data.length < 10)
      for (let i = data.length; i < 10; i++)
        data.push({ id: i + 1, firstIp: "", secondIp: "" });
    dispatch(setIpsState(data));
  }, []);

  useEffect(() => {
    if (!managers.length) fetchManagers(setManagers);
    if (!teams.length) fetchTeams(setTeams);
    if (!ips.length) fetchBlockedIps(setIps);
  }, []);

  const customStyles = {
    pagination: {
      style: {
        fontSize: "1rem",
        minHeight: 28,
        height: 28,
      },
    },
    headCells: {
      style: {
        fontSize: "1rem",
      },
    },
    rows: {
      style: {
        fontSize: "1rem",
        // minHeight: "40px",
        height: 34,
      },
    },
  };

  const handleChangeUser = (e) =>
    setUser((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleChangeTeam = (e) =>
    setTeam((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleChangeIps = (id, key, value) => {
    setProcessedIps((p) =>
      p.map((ip) => (ip.id === id ? { ...ip, [key]: value } : ip))
    );
  };

  const handleChangeManager = (id, key, value) =>
    setProcessedManagers((p) =>
      p.map((m) => (m.id === id ? { ...m, [key]: value } : m))
    );

  const handleSaveIps = async (ip) => {
    const ipBefore = ips.find(({ id }) => id === ip.id);
    const unChanged = Object.keys(ipBefore).every(
      (key) => ipBefore[key] === ip[key]
    );
    if (unChanged) {
      handleChangeIps(ip.id, "isEdit", false);
      return;
    }
    for (let key in ip)
      if (!ip[key]) return toast.error(key + " value cannot be empty");

    try {
      delete ip.isEdit;
      if (ip.id < 10) {
        delete ip.id;
        await addBlockedIp(ip);
        toast.success("Ip blocked successfully");
      } else {
        await updateBlockedIp(ip.id, ip);
        toast.success("Ip updated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating ip");
    }
  };

  const handleSaveManager = async (manager) => {
    const originalManager = managers.find(({ id }) => id === manager.id);
    const unChanged = Object.keys(originalManager).every(
      (key) => originalManager[key] === manager[key]
    );
    if (unChanged) {
      handleChangeManager(manager.id, "isEdit", false);
      return;
    }
    for (let key in manager)
      if (!manager[key]) return toast.error(key + " value cannot be empty");

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
      await updateManager(manager.id, manager);
      toast.success("Manager updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error updating manager");
    }
  };

  const toggleDisableIp = async (id, isBlocked) => {
    if (id < 10) return;
    try {
      await updateBlockedIp(id, {
        isBlocked,
      });
      toast.success(
        isBlocked ? "Ip blocked successfully" : "Ip unblocked successfully"
      );
    } catch (error) {
      console.error(error);
      toast.error("Error updating Ip");
    }
  };

  const toggleActiveManager = async (id, isActive) => {
    try {
      await updateManager(id, {
        isActive,
      });
      toast.success(isActive ? "Manager is active" : "Manager is disabled");
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
      // const formattedDate = new Date().toLocaleDateString("en-US");
      await addDoc(collection(db, "managers"), {
        ...user,
        password: "manager",
        isActive: true,
        date: serverTimestamp(),
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
    setProcessedIps(ips);
  }, [ips]);

  const filteredManagers = searchText
    ? filterSearchObjects(searchText, processedManagers)
    : processedManagers;
  const filteredTeams = searchText
    ? filterSearchObjects(searchText, teams)
    : teams;

  const searchOptions =
    tab === "Managers" ? administratorsColumns() : teamsColumns;

  return (
    <div id="users" className="active">
      <div
        id="users-div"
        // className="hidden"
      >
        <Navbar className="nav nav-tabs p-0">
          <Nav className="me-auto" style={{ gap: "2px" }}>
            <Nav.Link
              className={tab === "IP Monitor" ? "active" : ""}
              onClick={() => setTab("IP Monitor")}
            >
              IP Monitor
            </Nav.Link>
            <Nav.Link
              className={tab === "Managers" ? "active" : ""}
              onClick={() => setTab("Managers")}
            >
              Managers
            </Nav.Link>
            <Nav.Link
              className={tab === "Teams" ? "active" : ""}
              onClick={() => setTab("Teams")}
            >
              Teams
            </Nav.Link>
          </Nav>
        </Navbar>
        {tab === "IP Monitor" ? (
          <div className="d-flex justify-content-between font-bold px-3 my-2">
            <span className="text-bold-500">
              Players online: {playersOnlineCount}
            </span>
            <span className="text-bold-500">
              Managers online: {managersOnlineCount}
            </span>
            <span className="text-bold-500">
              Total players registered: {players.length}
            </span>
            <span className="text-bold-500">
              Total managers active: {totalManagersActive}
            </span>
            <span className="text-bold-500">
              Total users: {players.length + totalManagersActive}
            </span>
          </div>
        ) : (
          <div className="input-group input-group-sm gap-1 my-2">
            <select
              className="input-group-text"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
            >
              <option className="d-none" disabled value="">
                Search By
              </option>
              {searchOptions.map(({ name }, i) => (
                <option key={i} className="dropdown-item">
                  {name}
                </option>
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
        )}
        <div>
          {tab === "IP Monitor" && (
            <DataTable
              columns={ipMonitorsColumns({
                handleChangeIps,
                handleSaveIps,
                toggleDisableIp,
              })}
              data={fillArrayWithEmptyRows(processedIps, 10)}
              // pagination
              paginationTotalRows={ips.length}
              // paginationPerPage={10}
              paginationComponentOptions={{
                noRowsPerPage: 1,
              }}
              // paginationRowsPerPageOptions={[5, 10, 20, 50]}
              dense
              customStyles={customStyles}
              highlightOnHover
              pointerOnHover
              responsive
            />
          )}
          {tab === "Managers" && (
            <DataTable
              columns={administratorsColumns({
                handleChangeManager,
                handleSaveManager,
                toggleActiveManager,
                teams,
              })}
              data={fillArrayWithEmptyRows(filteredManagers, 10)}
              pagination
              paginationTotalRows={managers.length}
              paginationPerPage={10}
              paginationComponentOptions={{
                noRowsPerPage: 1,
              }}
              // paginationRowsPerPageOptions={[5, 10, 20, 50]}
              dense
              customStyles={customStyles}
              highlightOnHover
              pointerOnHover
              responsive
            />
          )}
          {tab === "Teams" && (
            <DataTable
              columns={teamsColumns}
              data={fillArrayWithEmptyRows(filteredTeams, 10)}
              pagination
              paginationTotalRows={teams.length}
              paginationPerPage={10}
              // paginationRowsPerPageOptions={[10, 20, 50]}
              paginationComponentOptions={{
                noRowsPerPage: 1,
              }}
              dense
              customStyles={customStyles}
              highlightOnHover
              pointerOnHover
              responsive
            />
          )}
        </div>
      </div>
      <div
        id="newUser-form"
        className="d-flex flex-column gap-3 mx-3 py-2 rounded"
      >
        <div className="w-75 mx-auto">
          <h5 className="d-inline-block">Manager</h5>
          <form>
            <div className="d-flex gap-1">
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
                <option value="Admin">Admin</option>
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
            <div className="mt-2 d-flex justify-content-center gap-1">
              <button
                className="btn btn-outline-secondary"
                type="button"
                // onClick={deleteUser}
              >
                Delete
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={addUser}
              >
                Add
              </button>
            </div>
          </form>
        </div>
        <div className="w-50 mx-auto">
          <h5 className="d-inline-block">Team</h5>
          <form>
            <div className="d-flex gap-1">
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
          <div className="mt-2 d-flex justify-content-center gap-1">
            <button
              className="btn btn-outline-secondary"
              type="button"
              // onClick={deleteUser}
            >
              Delete
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleAddNewTeam}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
