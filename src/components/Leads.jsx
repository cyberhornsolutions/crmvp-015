import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { Dropdown, ProgressBar } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faClose,
  faL,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { BsGear } from "react-icons/bs";
import DelOrderModal from "./DelOrderModal";
import CircleIcon from "@mui/icons-material/Circle";
import EditOrder from "./EditOrder";
import {
  getUserById,
  fetchPlayers,
  getAllSymbols,
  fetchManagers,
} from "../utills/firebaseHelpers";
import { setUserOrders } from "../redux/slicer/orderSlicer";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/slicer/userSlice";
import AddBalanceModal from "./AddBalanceModal";
import TradingSettings from "./TradingSettings";
import {
  calculateProfit,
  convertTimestamptToDate,
  fillArrayWithEmptyRows,
  filterSearchObjects,
  getAskValue,
  getBidValue,
} from "../utills/helpers";
import dealsColumns from "./columns/dealsColumns";
import { setSymbolsState } from "../redux/slicer/symbolsSlicer";
import moment from "moment";
import SelectColumnsModal from "./SelectColumnsModal";
import { setPlayersState } from "../redux/slicer/playersSlicer";
import { setManagersState } from "../redux/slicer/managersSlice";

export default function Leads({ setTab }) {
  const user = useSelector((state) => state.user.user);
  const players = useSelector((state) => state.players);
  const userOrders = useSelector((state) => state?.userOrders?.orders);
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const symbols = useSelector((state) => state?.symbols);
  const managers = useSelector((state) => state.managers);
  const [selected, setSelected] = useState();
  const [searchBy, setSearchBy] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedOrder, setSelectedOrder] = useState();
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isBalanceModal, setIsBalanceModal] = useState(false);
  const [tradingSettingsModal, setTradingSettingsModal] = useState(false);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [hidePlayersColumns, setHidePlayersColumns] = useState({});
  const [hideDealsColumns, setHideDealsColumns] = useState({});
  const dispatch = useDispatch();
  const progressBarConfig = {
    New: { variant: "success", now: 25 },
    Sale: { variant: "info", now: 50 },
    Reten: { variant: "warning", now: 75 },
    VIP: { variant: "danger", now: 100 },
  };
  const handleEditOrder = (row) => {
    setSelectedOrder(row);
    setShowEditOrderModal(true);
  };

  const handleCloseOrder = (row) => {
    setSelectedOrder(row);
    setIsDelModalOpen(true);
  };

  const setPlayers = useCallback((players) => {
    if (user.role !== "Admin")
      players = players.filter(({ manager }) => manager === user.username);
    dispatch(setPlayersState(players));
  }, []);

  const setSymbols = useCallback((symbolsData) => {
    dispatch(setSymbolsState(symbolsData));
  }, []);

  const setManagers = useCallback((data) => {
    dispatch(setManagersState(data));
  }, []);

  let filteredUsers = isOnline
    ? players.filter((el) => el.onlineStatus == true)
    : players;
  if (searchText)
    filteredUsers = filterSearchObjects(searchText, filteredUsers);

  useEffect(() => {
    if (!players.length) fetchPlayers(setPlayers);
    if (!symbols.length) getAllSymbols(setSymbols);
    if (!managers.length) fetchManagers(setManagers);

    const headers = document.querySelectorAll(".rdt_TableHead");
    if (!headers.length) return;
    const dealsCols = dealsColumns().reduce(
      (p, { name }) => ({ ...p, [name]: false }),
      {}
    );
    const playersCols = userColumns.reduce(
      (p, { name }) => ({ ...p, [name]: false }),
      {}
    );
    setHidePlayersColumns(playersCols);
    setHideDealsColumns(dealsCols);
    const handlePlayersRightClick = (e) => {
      e.preventDefault();
      setShowColumnsModal("players");
    };
    const handleDealsRightClick = (e) => {
      e.preventDefault();
      setShowColumnsModal("deals");
    };
    headers.item(0)?.addEventListener("contextmenu", handlePlayersRightClick);
    headers.item(1)?.addEventListener("contextmenu", handleDealsRightClick);
    return () => {
      headers
        .item(0)
        ?.removeEventListener("contextmenu", handlePlayersRightClick);
      headers
        .item(1)
        ?.removeEventListener("contextmenu", handleDealsRightClick);
    };
  }, []);

  console.log("mangers = ", managers);

  const fetchOrders = async (row, isOk) => {
    try {
      const q = query(
        collection(db, "orders"),
        orderBy("createdTime", "desc"),
        where("userId", "==", row?.id)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const orders = [];

        querySnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        dispatch(setUserOrders(orders));
        if (isOk === true) {
          setTab("MainBoard");
        }
      });
      dispatch(setSelectedUser(row));
      setSelected(row?.id);

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleDropdownItemClick = async (val, userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: val,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeManager = async (id, val) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        manager: val,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const deals = userOrders
    .filter((order) => order.status === "Pending" && !order.enableOpenPrice)
    .map((order) => {
      const symbol = symbols.find((s) => s.symbol === order.symbol);
      if (!symbol) return order;
      let enableOpenPrice = false;
      if (order.enableOpenPrice && order.openPriceValue !== symbol.price) {
        enableOpenPrice = true;
      }
      const {
        bidSpread,
        bidSpreadUnit,
        askSpread,
        askSpreadUnit,
        fee,
        feeUnit,
        swapShort,
        swapShortUnit,
        swapLong,
        swapLongUnit,
      } = symbol.settings;

      let swapValue = 0;
      if (order.createdTime) {
        const swap = order.type === "Buy" ? swapShort : swapLong;
        const swapUnit = order.type === "Buy" ? swapShortUnit : swapLongUnit;
        const jsDate = new Date(order.createdTime.seconds * 1000).setHours(
          0,
          0,
          0
        );
        const days = swap * moment().diff(jsDate, "d");
        swapValue = swapUnit === "$" ? swap * days : (order.sum / 100) * days;
      }

      const currentPrice =
        order.type === "Buy"
          ? getBidValue(symbol.price, bidSpread, bidSpreadUnit === "$")
          : getAskValue(symbol.price, askSpread, askSpreadUnit === "$");

      const spread = order.sum / 100; // 1% of sum
      const feeValue = feeUnit === "$" ? fee : spread * fee;
      const pledge = order.sum;

      let profit = calculateProfit(
        order.type,
        currentPrice,
        order.symbolValue,
        order.volume
      );
      profit = profit - swapValue - feeValue;

      return {
        ...order,
        currentPrice,
        enableOpenPrice,
        pledge: parseFloat(pledge),
        spread: parseFloat(spread),
        swap: parseFloat(swapValue),
        fee: parseFloat(feeValue),
        profit,
      };
    });

  const onUserDoubleClick = async (row) => {
    const u = await getUserById(row.id);
    dispatch(setSelectedUser(u));
    await fetchOrders(row, true);
  };
  const userColumns = [
    {
      name: "ID",
      selector: (row, i) =>
        row ? (
          <div className="d-flex align-items-center gap-1">
            {row.onlineStatus ? (
              <CircleIcon className="onlineGreen" />
            ) : (
              <CircleIcon className="onlineRed" />
            )}
            {i + 1}
          </div>
        ) : (
          ""
        ),
      sortable: false,
      compact: true,
      width: "50px",
      omit: hidePlayersColumns.ID,
    },
    {
      name: "Registered",
      selector: (row) =>
        row.createdAt && convertTimestamptToDate(row.createdAt),
      sortable: false,
      grow: 2,
      omit: hidePlayersColumns.Registered,
    },
    {
      name: "Name",
      cell: (row) => (row.surname ? row.name + " " + row.surname : row.name),
      sortable: true,
      sortFunction: (rowA, rowB) => {
        const a = rowA.name;
        const b = rowB.name;

        if (a > b) {
          return 1;
        }

        if (b > a) {
          return -1;
        }

        return 0;
      },
      omit: hidePlayersColumns.Name,
    },
    {
      name: "Status",
      cell: (row) =>
        row && (
          <Dropdown data-bs-theme="light" className="custom-dropdown">
            <Dropdown.Toggle variant="none" id="dropdown-basic">
              {row.status && progressBarConfig[row.status] && (
                <ProgressBar
                  variant={progressBarConfig[row.status].variant}
                  now={progressBarConfig[row.status].now}
                  className="progressbar"
                />
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="custom-dropdown-menu"
              data-bs-theme="dark"
            >
              {Object.keys(progressBarConfig).map((status) => (
                <Dropdown.Item
                  key={status}
                  onClick={() => handleDropdownItemClick(status, row.id)}
                  className={row.status === status ? "active-status" : ""}
                >
                  {row.status === status ? <span>&#10004;</span> : " "} {status}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        ),
      sortable: false,
      omit: hidePlayersColumns.Status,
    },
    {
      name: "Phone",
      selector: (row) => (row ? (row.phone ? row.phone : "12312321") : ""),
      omit: hidePlayersColumns.Phone,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      sortFunction: (rowA, rowB) => {
        const a = rowA.email;
        const b = rowB.email;

        if (a > b) {
          return 1;
        }

        if (b > a) {
          return -1;
        }

        return 0;
      },
      omit: hidePlayersColumns.Email,
    },
    {
      name: "Balance",
      selector: (row) => row.totalBalance,
      omit: hidePlayersColumns.Balance,
    },
    {
      name: "Deposit",
      selector: (row) => (row ? (row.deposit ? row.deposit : "50") : ""),
      omit: hidePlayersColumns.Deposit,
    },
    {
      name: "Manager",
      cell: (row) =>
        row && (
          <Dropdown data-bs-theme="light">
            <Dropdown.Toggle variant="none" className="border-0 lh-sm">
              <div>
                {managers.find((m) => m.username === row.manager)?.name}
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="ps-3" data-bs-theme="dark">
              {managers
                .filter((m) =>
                  row.status === "New" || row.status === "Sale"
                    ? m.role === "Sale"
                    : m.role === "Reten"
                )
                .map((m, i) => (
                  <Dropdown.Item
                    key={i}
                    onClick={() => handleChangeManager(row.id, m.username)}
                  >
                    {row.manager === m.username ? <span>&#10004;</span> : " "}{" "}
                    {m.name}
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown>
        ),
      omit: hidePlayersColumns.Manager,
    },
    {
      name: "Actions",
      selector: (row) => row.id,
      cell: (row) =>
        row && (
          <div className="d-flex align-items-center gap-3">
            <FontAwesomeIcon
              icon={faEllipsis}
              onClick={() => {
                dispatch(setSelectedUser(row));
                setIsBalanceModal(true);
              }}
            />
            <BsGear
              size={18}
              onClick={() => {
                dispatch(setSelectedUser(row));
                setTradingSettingsModal(true);
              }}
            />
          </div>
        ),
      omit: hidePlayersColumns.Actions,
    },
  ];
  const conditionalRowStyles = [
    {
      when: (row) => row && row.id === selectedUser?.id,
      style: {
        backgroundColor: "#D1FFBD",
        userSelect: "none",
      },
    },
  ];
  const handleKeyPress = (event) => {
    const keyCode = event.keyCode || event.which;
    const keyValue = String.fromCharCode(keyCode);

    // Allow only numeric keys (0-9)
    if (!/^\d+$/.test(keyValue)) {
      event.preventDefault();
    }
  };

  return (
    <>
      <div id="leads" className="active">
        <div id="leads-div">
          <div className="d-flex align-items-center justify-content-between">
            <div className="input-group input-group-sm gap-1">
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
                {userColumns.slice(1).map(({ name }) => (
                  <option className="dropdown-item">{name}</option>
                ))}
              </select>
              <input
                className="form-control-sm"
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search.."
              />
            </div>
            <div className="show_all d-flex gap-2 flex-wrap flex-sm-nowrap">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsOnline(false)}
              >
                Show All
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsOnline(true)}
              >
                Show Online
              </button>
            </div>
          </div>
          <DataTable
            columns={userColumns}
            data={fillArrayWithEmptyRows(filteredUsers, 5)}
            highlightOnHover
            pointerOnHover
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 20, 50]}
            conditionalRowStyles={conditionalRowStyles}
            onRowClicked={(row) => fetchOrders(row, false)}
            onRowDoubleClicked={onUserDoubleClick}
            // responsive
          />
        </div>
        <div id="lead-transactions">
          <div className="d-flex gap-3 pt-2">
            <h6>Deals</h6>
            <h6>{selected}</h6>
          </div>
          <DataTable
            columns={dealsColumns({
              handleEditOrder,
              handleCloseOrder,
              hideColumns: hideDealsColumns,
            })}
            data={fillArrayWithEmptyRows(deals, 3)}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 20, 50]}
            highlightOnHover
            pointerOnHover
          />
        </div>
      </div>
      {isBalanceModal && <AddBalanceModal setShowModal={setIsBalanceModal} />}
      {tradingSettingsModal && (
        <TradingSettings setShowModal={setTradingSettingsModal} />
      )}
      {isDelModalOpen && (
        <DelOrderModal
          onClose={() => setIsDelModalOpen(false)}
          selectedOrder={selectedOrder}
        />
      )}
      {showEditOrderModal && (
        <EditOrder
          onClose={() => setShowEditOrderModal(false)}
          selectedOrder={selectedOrder}
        />
      )}
      {showColumnsModal && (
        <SelectColumnsModal
          setModal={setShowColumnsModal}
          columns={
            showColumnsModal === "deals" ? hideDealsColumns : hidePlayersColumns
          }
          setColumns={
            showColumnsModal === "deals"
              ? setHideDealsColumns
              : setHidePlayersColumns
          }
          position={
            showColumnsModal === "deals" ? "deals-columns" : "players-columns"
          }
        />
      )}
    </>
  );
}
