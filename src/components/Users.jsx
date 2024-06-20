import React, { useEffect, useState, useCallback, useRef } from "react";
import { Nav, Navbar, Form } from "react-bootstrap";
import { auth, db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import managerColumns from "./columns/managerColumns";
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
import { setTeamsState } from "../redux/slicer/teamsSlice";
import { setIpsState } from "../redux/slicer/ipsSlicer";
import SaveOrderModal from "./SaveOrderModal";
import CreateManagerModal from "./CreateManagerModal";
import CreateTeamModal from "./CreateTeamModal";

export default function Users() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("IP Monitor");
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [isSaveIpModalOpen, setIsSaveIpModalOpen] = useState(false);
  const [showCreateManagerModal, setShowCreateManagerModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState();
  const selectedRowRef = useRef(null);
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
      p.map((ip) => {
        if (key === "isEdit" && value) delete ip.isEdit;
        return ip.id === id ? { ...ip, [key]: value } : ip;
      })
    );
  };

  const handleChangeManager = (id, key, value) =>
    setProcessedManagers((p) =>
      p.map((m) => (m.id === id ? { ...m, [key]: value } : m))
    );

  const handleSaveIps = async (ip) => {
    if (!ip && selectedRow)
      ip = processedIps.find(({ id }) => id === selectedRow.id);
    const ipBefore = ips.find(({ id }) => id === ip.id);
    const unChanged = Object.keys(ipBefore).every(
      (key) => ipBefore[key] === ip[key]
    );
    if (unChanged) {
      handleChangeIps(ip.id, "isEdit", false);
      setIsSaveIpModalOpen(false);
      return;
    }
    if (!ip.firstIp || !ip.secondIp)
      return toast.error("First Ip & Second Ip value cannot be empty");

    const { firstIp, secondIp } = ip;
    const firstIpParts = firstIp.split(".").filter((i) => i);
    const secondIpParts = secondIp.split(".").filter((i) => i);
    if (firstIpParts.length < 4 || secondIpParts.length < 4)
      return toast.error("Invalid ip length");

    for (let part of firstIpParts)
      if (Number.isNaN(+part) || +part < 0 || +part > 255)
        return toast.error("Invalid ip");

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
      handleCloseSaveModal();
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
        updatedAt: serverTimestamp(),
      });
      toast.success(isActive ? "Manager is active" : "Manager is disabled");
    } catch (error) {
      console.error(error);
      toast.error("Error updating manager");
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

  const handleCloseSaveModal = (reset) => {
    if (reset) setProcessedIps(ips);
    setIsSaveIpModalOpen(false);
    setSelectedRow();
  };

  useEffect(() => {
    setProcessedManagers(
      managers.filter(({ username }) => username !== "admin")
    );
  }, [managers, tab]);
  useEffect(() => {
    setProcessedIps(ips);
    selectedRowRef.current = null;
  }, [ips, tab]);

  useEffect(() => {
    if (!selectedRowRef.current || tab !== "IP Monitor") return;
    const handleOutsideClick = (e) => {
      if (selectedRowRef.current.contains(e.target)) return;
      selectedRowRef.current = null;
      setIsSaveIpModalOpen(true);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      selectedRowRef.current = null;
    };
  }, [selectedRowRef.current, selectedRow]);

  const filteredManagers = searchText
    ? filterSearchObjects(searchText, processedManagers)
    : processedManagers;
  const filteredTeams = searchText
    ? filterSearchObjects(searchText, teams)
    : teams;

  const searchOptions = tab === "Managers" ? managerColumns() : teamsColumns;

  return (
    <>
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
                  selectedRowRef,
                  setSelectedRow,
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
                columns={managerColumns({
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
        <div className="d-flex justify-content-around align-items-center mt-3">
          <button
            className="btn btn-secondary"
            onClick={() => setShowCreateManagerModal(true)}
          >
            Create Manager
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowCreateTeamModal(true)}
          >
            Create Team
          </button>
          <button
            className="btn btn-secondary"
            // onClick={() => setShowCreateManagerModal(true)}
          >
            Create Player
          </button>
        </div>
      </div>
      {isSaveIpModalOpen && (
        <SaveOrderModal
          handleSaveOrder={() => handleSaveIps()}
          closeModal={handleCloseSaveModal}
        />
      )}
      {showCreateManagerModal && (
        <CreateManagerModal setShowModal={setShowCreateManagerModal} />
      )}
      {showCreateTeamModal && (
        <CreateTeamModal setShowModal={setShowCreateTeamModal} />
      )}
    </>
  );
}
