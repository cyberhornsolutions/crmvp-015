import { useEffect, useState, useCallback, useRef } from "react";
import { Nav, Navbar } from "react-bootstrap";
import { serverTimestamp } from "firebase/firestore";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import managerColumns from "./columns/managerColumns";
import ipMonitorsColumns from "./columns/ipMonitorColumns";
import teamsColumns from "./columns/teamsColumns";
import {
  addBlockedIp,
  addNewAssetGroup,
  addStatus,
  fetchBlockedIps,
  getManagerByUsername,
  updateAssetGroups,
  updateBlockedIp,
  updateManager,
  updateStatus,
} from "../utills/firebaseHelpers";
import { fillArrayWithEmptyRows, filterSearchObjects } from "../utills/helpers";
import { useDispatch, useSelector } from "react-redux";
import { setIpsState } from "../redux/slicer/ipsSlicer";
import SaveOrderModal from "./SaveOrderModal";
import CreateManagerModal from "./CreateManagerModal";
import CreateTeamModal from "./CreateTeamModal";
import CreatePlayerModal from "./CreatePlayerModal";
import SelectColumnsModal from "./SelectColumnsModal";
import ChangeManagerPasswordModal from "./ChangeManagerPasswordModal";
import statusColumns from "./columns/statusColumns";
import assetGroupsColumns from "./columns/assetGroupsColumns";

export default function Users() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("IP Monitor");
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [isSaveIpModalOpen, setIsSaveIpModalOpen] = useState(false);
  const [showCreateManagerModal, setShowCreateManagerModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreatePlayerModal, setShowCreatePlayerModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState();
  const selectedRowRef = useRef(null);
  const managers = useSelector((state) => state.managers);
  const teams = useSelector((state) => state.teams);
  const players = useSelector((state) => state.players);
  const ips = useSelector((state) => state.ips);
  const columns = useSelector((state) => state.columns);
  const statuses = useSelector((state) => state.statuses);
  const assetGroups = useSelector((state) => state.assetGroups);

  const playersOnlineCount = players.filter((el) => el.onlineStatus).length;
  const managersOnlineCount = managers.filter((m) => m.onlineStatus).length;
  const totalManagersActive = managers.filter((m) => m.isActive).length;

  const [processedManagers, setProcessedManagers] = useState([]);
  const [processedIps, setProcessedIps] = useState([]);
  const [showManagerColumns, setShowManagerColumns] = useState({});
  const [showManagerColumnsModal, setShowManagerColumnsModal] = useState(false);
  const [showRepeatPasswordModal, setShowRepeatPasswordModal] = useState(false);
  const [managerInfo, setManagerInfo] = useState({});
  const [processedStatuses, setProcessedStatuses] = useState([]);
  const [processedAssetGroups, setProcessedAssetGroups] = useState([]);

  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);
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

  const setIps = useCallback((data) => {
    if (data.length < 10)
      for (let i = data.length; i < 10; i++)
        data.push({ id: i + 1, firstIp: "", secondIp: "" });
    dispatch(setIpsState(data));
  }, []);

  useEffect(() => {
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

  const handleIsPasswordConfirmed = () => setIsPasswordConfirmed(true);
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

  const handleChangeStatus = (id, k, v) => {
    setProcessedStatuses((p) =>
      p.map((status) => {
        if (k === "isEdit" && v) delete status.isEdit;
        return status.id === id ? { ...status, [k]: v } : status;
      })
    );
  };

  const handleSaveStatus = async (status) => {
    if (!status && selectedRow)
      status = processedStatuses.find(({ id }) => id === selectedRow.id);
    const statusBefore = statuses.find(({ id }) => id === status.id);
    const unChanged = Object.keys(statusBefore).every(
      (key) => statusBefore[key] === status[key]
    );
    if (unChanged) {
      handleChangeStatus(status.id, "isEdit", false);
      return;
    }
    if (!status.status) return toast.error("Status value cannot be empty");
    try {
      delete status.isEdit;
      if (status.id < 10) {
        delete status.id;
        await addStatus(status);
        toast.success("Status added successfully");
      } else {
        await updateStatus(status.id, status);
        toast.success("Status updated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
    }
  };

  const toggleDisableStatus = async (id, isActive) => {
    if (id < 10) return;
    try {
      await updateStatus(id, {
        isActive: isActive,
      });
      toast.success(
        isActive
          ? "Status activated successfully"
          : "Status deactivated successfully"
      );
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
    }
  };

  const handleChangeAssetGroups = (id, k, v) => {
    setProcessedAssetGroups((p) =>
      p.map((group) => {
        if (k === "isEdit" && v) delete group.isEdit;
        return group.id === id ? { ...group, [k]: v } : group;
      })
    );
  };

  const handleSaveAssetGroups = async (group) => {
    if (!group && selectedRow)
      group = processedAssetGroups.find(({ id }) => id === selectedRow.id);
    const groupBefore = assetGroups.find(({ id }) => id === group.id);
    const unChanged = Object.keys(groupBefore).every(
      (key) => groupBefore[key] === group[key]
    );
    if (unChanged) {
      handleChangeAssetGroups(group.id, "isEdit", false);
      return;
    }
    if (!group.title) return toast.error("Title value cannot be empty");
    try {
      delete group.isEdit;
      if (group.id < 10) {
        delete group.id;
        await addNewAssetGroup(group);
        toast.success("Asset group added successfully");
      } else {
        await updateAssetGroups(group.id, group);
        toast.success("Asset group updated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating asset group");
    }
  };

  const toggleDisableAssetGroups = async (id, closedMarket) => {
    if (id < 10) return;
    try {
      await updateAssetGroups(id, {
        closedMarket: closedMarket,
      });
      toast.success(
        closedMarket
          ? "Closed Market activated successfully"
          : "Closed Market deactivated successfully"
      );
    } catch (error) {
      console.error(error);
      toast.error("Error updating Closed Market");
    }
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

  const handleSaveManager = async (manager, checkPassword) => {
    ["date", "updatedAt"].forEach((k) => delete manager[k]);
    const originalManager = managers.find(({ id }) => id === manager.id);
    const unChanged = Object.keys(manager).every((key) => {
      if (originalManager[key] === undefined) return true;
      return originalManager[key] === manager[key];
    });

    if (originalManager.password !== manager.password && !checkPassword) {
      setManagerInfo(manager);
      setShowRepeatPasswordModal(true);
    } else {
      if (unChanged) {
        handleChangeManager(manager.id, "isEdit", false);
        return;
      }
      for (let key in manager)
        if (!manager[key] && manager[key] !== false)
          return toast.error(key + " value cannot be empty");
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
        await updateManager(manager.id, {
          ...manager,
          updatedAt: serverTimestamp(),
        });
        toast.success("Manager updated successfully");
      } catch (error) {
        console.error(error);
        toast.error("Error updating manager");
      }
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
    if (tab !== "Statuses") return;
    let data = [...statuses];
    if (statuses.length < 10)
      for (let i = statuses.length; i < 10; i++)
        data.push({ id: i + 1, status: "", isActive: false });
    selectedRowRef.current = null;
    setProcessedStatuses(data);
  }, [statuses, tab]);

  useEffect(() => {
    if (tab !== "Groups") return;
    let data = [...assetGroups];
    if (assetGroups.length < 10)
      for (let i = assetGroups.length; i < 10; i++)
        data.push({ id: i + 1, title: "", closedMarket: false });
    selectedRowRef.current = null;
    setProcessedAssetGroups(data);
  }, [assetGroups, tab]);

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

  useEffect(() => {
    if (tab === "Managers") {
      const header = document.querySelector(".rdt_TableHead");
      if (!header) return;
      if (columns.managerColumns) {
        setShowManagerColumns(columns.managerColumns);
      } else {
        const managerCols = managerColumns().reduce(
          (p, { name }) => ({ ...p, [name]: true }),
          {}
        );
        setShowManagerColumns(managerCols);
      }
      const handleManagerRightClick = (e) => {
        e.preventDefault();
        setShowManagerColumnsModal(true);
      };
      header.addEventListener("contextmenu", handleManagerRightClick);
      return () => {
        header.removeEventListener("contextmenu", handleManagerRightClick);
      };
    }
  }, [tab]);

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
              <Nav.Link
                className={tab === "Statuses" ? "active" : ""}
                onClick={() => setTab("Statuses")}
              >
                Statuses
              </Nav.Link>
              <Nav.Link
                className={tab === "Groups" ? "active" : ""}
                onClick={() => setTab("Groups")}
              >
                Groups
              </Nav.Link>
            </Nav>
          </Navbar>
          {tab === "IP Monitor" || tab === "Statuses" || tab === "Groups" ? (
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
                  showColumns: showManagerColumns,
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
            {tab === "Statuses" && (
              <DataTable
                columns={statusColumns({
                  handleChangeStatus,
                  handleSaveStatus,
                  selectedRowRef,
                  setSelectedRow,
                  toggleDisableStatus,
                })}
                data={fillArrayWithEmptyRows(processedStatuses, 10)}
                // pagination
                paginationTotalRows={statuses.length}
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
            {tab === "Groups" && (
              <DataTable
                columns={assetGroupsColumns({
                  handleChangeAssetGroups,
                  handleSaveAssetGroups,
                  selectedRowRef,
                  setSelectedRow,
                  toggleDisableAssetGroups,
                })}
                data={fillArrayWithEmptyRows(processedAssetGroups, 10)}
                // pagination
                paginationTotalRows={assetGroups.length}
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
            onClick={() => setShowCreatePlayerModal(true)}
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
      {showRepeatPasswordModal && (
        <ChangeManagerPasswordModal
          setShowModal={setShowRepeatPasswordModal}
          handleSaveManager={handleSaveManager}
          manager={managerInfo}
        />
      )}
      {showCreateTeamModal && (
        <CreateTeamModal setShowModal={setShowCreateTeamModal} />
      )}
      {showCreatePlayerModal && (
        <CreatePlayerModal setShowModal={setShowCreatePlayerModal} />
      )}
      {showManagerColumnsModal && (
        <SelectColumnsModal
          columnKey={"managerColumns"}
          setModal={setShowManagerColumnsModal}
          columns={showManagerColumns}
          setColumns={setShowManagerColumns}
        />
      )}
    </>
  );
}
