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

export default function Leads({ setTab }) {
  const userOrders = useSelector((state) => state?.userOrders?.orders);
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const symbols = useSelector((state) => state?.symbols);
  const [selected, setSelected] = useState();
  const [users, setUsers] = useState([]);
  const [searchBy, setSearchBy] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusUpdate, setStatusUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState();
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isBalanceModal, setIsBalanceModal] = useState(false);
  const [tradingSettingsModal, setTradingSettingsModal] = useState(false);
  const dispatch = useDispatch();
  const progressBarConfig = {
    New: { variant: "success", now: 25 },
    InProgress: { variant: "info", now: 50 },
    Confirmed: { variant: "warning", now: 75 },
    Closed: { variant: "danger", now: 100 },
  };

  const handleEditOrder = (row) => {
    setSelectedOrder(row);
    setShowEditOrderModal(true);
  };

  const handleCloseOrder = (row) => {
    setSelectedOrder(row);
    setIsDelModalOpen(true);
  };

  const setSymbols = useCallback((symbolsData) => {
    dispatch(setSymbolsState(symbolsData));
  }, []);

  let filteredUsers = isOnline
    ? users.filter((el) => el.onlineStatus == true)
    : users;
  if (searchText)
    filteredUsers = filterSearchObjects(searchText, filteredUsers);

  useEffect(() => {
    if (!symbols.length) {
      getAllSymbols(setSymbols);
    }
    return fetchPlayers(setUsers);
  }, []);

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
    console.log("Dropdown", val, userId);
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      status: val,
    });
    setStatusUpdate(true);
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
      name: "",
      selector: "",
      cell: (row) =>
        row ? (
          <input
            type="checkbox"
            checked={row.checked}
            // onChange={() => handleCheckboxChange(row.id)}
          />
        ) : (
          ""
        ),
      grow: 0.25,
      compact: true,
      center: true,
    },
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
    },
    {
      name: "Registered",
      selector: (row) =>
        row.createdAt && convertTimestamptToDate(row.createdAt),
      sortable: false,
      grow: 2,
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
    },
    {
      name: "Status",
      cell: (row) =>
        row ? (
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
        ) : (
          ""
        ),
      sortable: false,
    },
    {
      name: "Sale",
      selector: (row) => (row ? (row.sale ? row.sale : "New") : ""),
      sortable: false,
    },
    {
      name: "Reten",
      selector: (row) => (row ? (row.reten ? row.reten : "New") : ""),
      sortable: false,
    },
    {
      name: "Phone",
      selector: (row) => (row ? (row.phone ? row.phone : "12312321") : ""),
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
    },
    {
      name: "Balance",
      selector: (row) => row.totalBalance,
    },
    {
      name: "Deposit",
      selector: (row) => (row ? (row.deposit ? row.deposit : "50") : ""),
    },
    {
      name: "Manager",
      selector: (row) => (row ? (row.manager ? row.manager : "Jhon") : ""),
    },
    {
      name: "Affiliates",
      selector: (row) =>
        row ? (row.affiliates ? row.affiliates : "Candy Land") : "",
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
    </>
  );
}
