import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Dropdown, ProgressBar } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { BsGear } from "react-icons/bs";
import DelOrderModal from "./DelOrderModal";
import CircleIcon from "@mui/icons-material/Circle";
import EditOrder from "./EditOrder";
import NewOrder from "./NewOrder";
import { getAllSymbols } from "../utills/firebaseHelpers";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/slicer/userSlice";
import AddBalanceModal from "./AddBalanceModal";
import TradingSettings from "./TradingSettings";
import {
  convertTimestamptToDate,
  fillArrayWithEmptyRows,
  filterSearchObjects,
} from "../utills/helpers";
import dealsColumns from "./columns/dealsColumns";
import { setSymbolsState } from "../redux/slicer/symbolsSlicer";
import SelectColumnsModal from "./SelectColumnsModal";

export default function Leads({ setTab }) {
  const user = useSelector((state) => state.user.user);
  const players = useSelector((state) => state.players);
  const orders = useSelector((state) => state.orders);
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const deposits = useSelector((state) => state.deposits);
  const symbols = useSelector((state) => state?.symbols);
  const managers = useSelector((state) => state.managers);
  const columns = useSelector((state) => state.columns);
  const [searchBy, setSearchBy] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedOrder, setSelectedOrder] = useState();
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isBalanceModal, setIsBalanceModal] = useState(false);
  const [tradingSettingsModal, setTradingSettingsModal] = useState(false);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [showPlayersColumns, setShowPlayersColumns] = useState({});
  const [showDealsColumns, setShowDealsColumns] = useState({});
  const [isHidden, setIsHidden] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const setSymbols = useCallback((symbolsData) => {
    dispatch(setSymbolsState(symbolsData));
  }, []);

  const filterPlayersByManager = (s, m, p) => {
    const manager = m.find((obj) => obj.username === s);
    const id = manager.id;
    return p.filter((obj) => obj.manager === id);
  };

  let filteredUsers = isOnline
    ? players.filter((el) => el.onlineStatus == true)
    : players;
  if (searchText)
    filteredUsers = filterSearchObjects(searchText, filteredUsers);
  if (selectedManager)
    filteredUsers = filterPlayersByManager(selectedManager, managers, players);
  filteredUsers = filteredUsers
    .map((player) =>
      player?.accounts?.length
        ? player?.accounts?.map((account) => ({
            ...player,
            account,
            id: account?.account_no,
            userId: player.id,
          }))
        : { ...player, userId: player.id }
    )
    .flat();

  useEffect(() => {
    if (searchBy !== "Manager") setSelectedManager("");
  }, [searchBy]);

  useEffect(() => {
    if (!symbols.length) getAllSymbols(setSymbols);

    const headers = document.querySelectorAll(".rdt_TableHead");
    if (!headers.length) return;
    if (columns.dealsColumns) {
      setShowDealsColumns(columns.dealsColumns);
    } else {
      const dealsCols = dealsColumns().reduce(
        (p, { name }) => ({ ...p, [name]: true }),
        {}
      );
      setShowDealsColumns(dealsCols);
    }
    if (columns.playersColumns) {
      setShowPlayersColumns(columns.playersColumns);
    } else {
      const cols =
        user.role === "Sale" ? userColumnsForSale : userColumnsForAdmin;
      const playersCols = cols.reduce(
        (p, { name }) => ({ ...p, [name]: true }),
        {}
      );
      setShowPlayersColumns(playersCols);
    }
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

  const handleChangeManager = async (id, manager) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { manager });
    } catch (error) {
      console.log(error);
    }
  };

  const deals = orders.filter(
    (o) =>
      o.userId === selectedUser?.userId &&
      o.status === "Pending" &&
      o.account_no === selectedUser?.account?.account_no &&
      !o.enableOpenPrice
  );

  const getKeyValue = (r, k) => {
    return String(k.split(".").reduce((sr, sk) => sr && sr[sk], r)) || "";
  };

  const isRowEmpty = (r) => {
    return Object.values(r).every((value) => value === "");
  };

  const sortFunction = (key) => (rowA, rowB) => {
    const a = getKeyValue(rowA, key).toLowerCase();
    const b = getKeyValue(rowB, key).toLowerCase();
    const isRowAEmpty = isRowEmpty(rowA);
    const isRowBEmpty = isRowEmpty(rowB);
    if (isRowAEmpty || isRowBEmpty) return 0;
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  };

  let userColumnsForSale = [
    {
      name: "Account",
      selector: (row) =>
        row ? (
          <div className="d-flex align-items-center gap-1">
            {row.onlineStatus ? (
              <CircleIcon className="onlineGreen" />
            ) : (
              <CircleIcon className="onlineRed" />
            )}
            {row?.account?.account_no || "N/A"}
          </div>
        ) : (
          ""
        ),
      sortable: false,
      compact: true,
      width: "60px",
      omit: !showPlayersColumns.Account,
    },
    {
      name: "Type",
      selector: (row) =>
        row ? (
          <div className="d-flex align-items-center gap-1">
            {row?.account?.account_type || "N/A"}
          </div>
        ) : (
          ""
        ),
      sortable: false,
      compact: true,
      width: "80px",
      omit: !showPlayersColumns.Account,
    },
    {
      name: "Registered",
      selector: (row) =>
        row.createdAt && convertTimestamptToDate(row.createdAt),
      sortable: false,
      grow: 2,
      omit: !showPlayersColumns.Registered,
    },
    {
      name: "Name",
      cell: (row) => row.name,
      sortable: true,
      sortFunction: sortFunction("name"),
      omit: !showPlayersColumns.Name,
    },
    {
      name: "Surname",
      cell: (row) => row.surname,
      sortable: true,
      sortFunction: sortFunction("surname"),
      omit: !showPlayersColumns.Surname,
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
                  onClick={() => handleDropdownItemClick(status, row.userId)}
                  className={row.status === status ? "active-status" : ""}
                >
                  {row.status === status ? <span>&#10004;</span> : " "} {status}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        ),
      sortable: false,
      omit: !showPlayersColumns.Status,
    },
    {
      name: "Phone",
      selector: (row) => (row ? (row.phone ? row.phone : "12312321") : ""),
      omit: !showPlayersColumns.Phone,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      sortFunction: sortFunction("email"),
      omit: !showPlayersColumns.Email,
    },
    {
      name: "Balance",
      selector: (row) => {
        if (!row || !row?.account) return;
        const ac = row.account;
        let equity =
          parseFloat(ac?.totalBalance) +
          parseFloat(ac?.activeOrdersProfit) -
          parseFloat(ac?.activeOrdersSwap);
        if (row?.settings?.allowBonus) equity += parseFloat(ac.bonus);
        const dealSum = orders
          .filter(
            (o) =>
              o.userId === row.userId &&
              o.status === "Pending" &&
              o.account_no === ac.account_no
          )
          .reduce((p, v) => p + +v.sum, 0);
        const freeMargin = equity - dealSum;
        const balance =
          freeMargin + parseFloat(ac.totalMargin) + parseFloat(ac.bonus);
        return +parseFloat(balance)?.toFixed(2);
      },
      omit: !showPlayersColumns.Balance,
    },
    {
      name: "Deposit",
      selector: (row) => (row ? (row.deposit ? row.deposit : "50") : ""),
      omit: !showPlayersColumns.Deposit,
    },
    {
      name: "Manager",
      cell: (row) =>
        row && (
          <Dropdown data-bs-theme="light">
            <Dropdown.Toggle variant="none" className="border-0 lh-sm">
              <div>{managers.find((m) => m.id === row.manager)?.username}</div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="ps-3" data-bs-theme="dark">
              {managers
                .filter(
                  (m) =>
                    m.isActive &&
                    (row.status === "New" || row.status === "Sale"
                      ? m.role === "Sale"
                      : m.role === "Reten")
                )
                .map((m, i) => (
                  <Dropdown.Item
                    key={i}
                    onClick={() => handleChangeManager(row.userId, m.id)}
                  >
                    {row.manager === m.id ? <span>&#10004;</span> : " "}{" "}
                    {m.username}
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown>
        ),
      omit: !showPlayersColumns.Manager,
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
      omit: !showPlayersColumns.Actions,
    },
  ];

  const calculateDepositedOrWithdrawn = (r, t) => {
    return deposits
      .filter(({ userId }) => userId === r?.userId)
      .filter(({ account_no }) => account_no === r?.account?.account_no)
      .filter(({ type }) => type === t)
      .reduce((p, { sum }) => p + +sum, 0);
  };

  const calculateEquity = (r) => {
    return (
      parseFloat(r?.account?.totalBalance) +
      parseFloat(r?.account?.activeOrdersProfit) -
      parseFloat(r?.account?.activeOrdersSwap)
    );
  };

  let userColumnsForAdmin = [
    {
      name: "Group",
      selector: (row) =>
        row ? (
          <div className="d-flex align-items-center gap-1">
            {row?.account?.account_type || "N/A"}
          </div>
        ) : (
          ""
        ),
      sortable: true,
      sortFunction: sortFunction("account.account_type"),
      omit: !showPlayersColumns.Group,
    },
    {
      name: "Account",
      selector: (row) =>
        row ? (
          <div className="d-flex align-items-center gap-1">
            {row.onlineStatus ? (
              <CircleIcon className="onlineGreen" />
            ) : (
              <CircleIcon className="onlineRed" />
            )}
            {row?.account?.account_no || "N/A"}
          </div>
        ) : (
          ""
        ),
      sortable: true,
      sortFunction: sortFunction("account.account_no"),
      omit: !showPlayersColumns.Account,
    },
    {
      name: "Name",
      cell: (row) => row && `${row?.name} ${row?.surname}`,
      sortable: true,
      sortFunction: sortFunction("name"),
      omit: !showPlayersColumns.Name,
      width: "200px",
    },
    {
      name: "Leverage",
      cell: (row) => row?.settings?.leverage,
      sortable: true,
      sortFunction: sortFunction("settings.leverage"),
      omit: !showPlayersColumns.Leverage,
    },

    {
      name: "Deposited",
      selector: (row) => {
        if (!row || !row?.account) return;
        return calculateDepositedOrWithdrawn(row, "Deposit");
      },
      omit: !showPlayersColumns.Deposited,
    },
    {
      name: "Withdrawn",
      selector: (row) => {
        if (!row || !row?.account) return;
        return calculateDepositedOrWithdrawn(row, "Withdraw");
      },
      omit: !showPlayersColumns.Withdrawn,
    },
    {
      name: "Bonuses",
      selector: (row) => row?.account?.bonus,
      sortable: true,
      sortFunction: sortFunction("account.bonus"),
      omit: !showPlayersColumns.Bonuses,
    },
    {
      name: "Deposited-Withdrawn",
      selector: (row) => {
        if (!row || !row?.account) return;
        const deposited = calculateDepositedOrWithdrawn(row, "Deposit");
        const withdrawn = calculateDepositedOrWithdrawn(row, "Withdraw");
        const diff = parseFloat(deposited) - parseFloat(withdrawn);
        return +parseFloat(diff).toFixed(2);
      },
      omit: !showPlayersColumns["Deposited-Withdrawn"],
      width: "145px",
    },
    {
      name: "Orders",
      selector: (row) => {
        if (!row || !row?.account) return;
        return orders.filter(
          (o) =>
            o.userId === row?.userId &&
            o.account_no === row?.account?.account_no &&
            o.status === "Pending" &&
            !o.enableOpenPrice
        ).length;
      },
      omit: !showPlayersColumns.Orders,
    },
    {
      name: "Level",
      selector: (row) => {
        if (!row || !row?.account) return;
        const equity = calculateEquity(row);
        const totalMargin = row?.account?.totalMargin;
        const userLevel = row?.settings?.level || 100;
        const level =
          totalMargin > 0 ? (equity / totalMargin) * (userLevel / 100) : 0;
        return `${+parseFloat(level)?.toFixed(2)}%`;
      },
      omit: !showPlayersColumns.Level,
    },
    {
      name: "Bonuses Used",
      selector: (row) => row?.account?.bonusSpent,
      omit: !showPlayersColumns["Bonuses Used"],
      width: "110px",
    },
    {
      name: "Profit",
      selector: (row) => {
        if (!row || !row?.account) return;
        return +parseFloat(row?.account?.activeOrdersProfit).toFixed(2);
      },
      sortable: true,
      sortFunction: sortFunction("account.activeOrdersProfit"),
      omit: !showPlayersColumns.Profit,
    },
    {
      name: "Margin",
      selector: (row) => row?.account?.totalMargin,
      sortable: true,
      sortFunction: sortFunction("account.totalMargin"),
      omit: !showPlayersColumns.Margin,
    },
    {
      name: "Free",
      selector: (row) => {
        if (!row || !row?.account) return;
        const acc = row.account;
        let equity = calculateEquity(row);
        if (row?.settings?.allowBonus) equity += parseFloat(acc.bonus);
        const dealSum = orders
          .filter(
            (o) =>
              o.userId === row.userId &&
              o.account_no === acc.account_no &&
              o.status === "Pending"
          )
          .reduce((p, v) => p + +v.sum, 0);
        const freeMargin = equity - dealSum;
        const free = freeMargin - parseFloat(acc.bonus);
        return +parseFloat(free)?.toFixed(2);
      },
      omit: !showPlayersColumns.Free,
    },
    {
      name: "Equity",
      selector: (row) => {
        if (!row || !row?.account) return;
        const equity = calculateEquity(row);
        return +parseFloat(equity).toFixed(2);
      },
      omit: !showPlayersColumns.Equity,
    },
    {
      name: "Balance",
      selector: (row) => {
        if (!row || !row?.account) return;
        const acc = row.account;
        let equity = calculateEquity(row);
        if (row?.settings?.allowBonus) equity += parseFloat(acc.bonus);
        const dealSum = orders
          .filter(
            (o) =>
              o.userId === row.userId &&
              o.account_no === acc.account_no &&
              o.status === "Pending"
          )
          .reduce((p, v) => p + +v.sum, 0);
        const freeMargin = equity - dealSum;
        const balance =
          freeMargin + parseFloat(acc.totalMargin) + parseFloat(acc.bonus);
        return +parseFloat(balance)?.toFixed(2);
      },
      omit: !showPlayersColumns.Balance,
    },
    {
      name: "Own Equity",
      selector: () => "",
      omit: !showPlayersColumns["Own Equity"],
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

  useEffect(() => {
    if (isHidden) return;
    const maxHeightPercentage = 96;
    const minHeightPercentage = 64;
    const leadsDiv = document.getElementById("leads-div");
    const leadTransactions = document.getElementById("lead-transactions");
    const resizeBar = document.getElementById("resize-bar");
    const handleMouseDown = (e) => {
      e.preventDefault();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };
    const handleMouseMove = (e) => {
      const windowHeight = window.innerHeight;
      let currentHeightPercentage = (e.clientY / windowHeight) * 100;
      currentHeightPercentage = Math.min(
        currentHeightPercentage,
        maxHeightPercentage
      );
      currentHeightPercentage = Math.max(
        currentHeightPercentage,
        minHeightPercentage
      );
      leadsDiv.style.height = `${currentHeightPercentage}%`;
      leadTransactions.style.height = `${100 - currentHeightPercentage}%`;
      let rows = 10;
      if (currentHeightPercentage > 73) rows = 12;
      if (currentHeightPercentage > 80) rows = 13;
      if (currentHeightPercentage > 92) rows = 16;
      setRowsPerPage(rows);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    resizeBar.addEventListener("mousedown", handleMouseDown);
    return () => {
      resizeBar.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isHidden]);

  return (
    <>
      <div id="leads" className="active">
        <div id="leads-div" style={{ height: isHidden ? "98%" : "64%" }}>
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
                {user.role === "Sale"
                  ? userColumnsForSale.map(({ name }, i) => (
                      <option key={i} className="dropdown-item">
                        {name}
                      </option>
                    ))
                  : userColumnsForAdmin.map(({ name }, i) => (
                      <option key={i} className="dropdown-item">
                        {name}
                      </option>
                    ))}
              </select>
              {searchBy === "Manager" ? (
                <select
                  className="input-group-text"
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                >
                  <option className="d-none" disabled value="">
                    All
                  </option>
                  {managers.map(({ username }, i) => (
                    <option key={i} className="dropdown-item">
                      {username}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-control-sm"
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search..."
                />
              )}
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
            key={rowsPerPage}
            columns={
              user.role === "Sale" ? userColumnsForSale : userColumnsForAdmin
            }
            data={fillArrayWithEmptyRows(filteredUsers, rowsPerPage)}
            highlightOnHover
            pointerOnHover
            pagination
            paginationComponentOptions={{
              noRowsPerPage: true,
              // rowsPerPageText: "ok",
              // rangeSeparatorText: "ok"
            }}
            paginationTotalRows={players.length}
            paginationPerPage={rowsPerPage}
            // paginationRowsPerPageOptions={[5, 10, 20, 50]}
            conditionalRowStyles={conditionalRowStyles}
            onRowClicked={(row) => row && dispatch(setSelectedUser(row))}
            onRowDoubleClicked={(row) => row && setTab("Player Card")}
            customStyles={{
              pagination: {
                style: {
                  fontSize: "1rem",
                  minHeight: 32,
                  height: 32,
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
                  minHeight: 32,
                  height: 32,
                },
              },
            }}
            // responsive
            dense
            // style={{
            //   fontSize: 18
            // }}
          />
        </div>
        {!isHidden && <div id="resize-bar"></div>}
        <div
          id="lead-transactions"
          style={{
            height: isHidden ? "" : "37%",
          }}
        >
          <div className="d-flex items-center justify-between">
            <div
              className="d-flex gap-4"
              style={{ visibility: isHidden ? "hidden" : "visible" }}
            >
              <h6 className="m-0">Deals</h6>
              <h6 className="m-0">{selectedUser?.id}</h6>
            </div>
            <button
              className="btn btn-secondary btn-sm px-4"
              onClick={() => {
                setIsHidden(!isHidden);
                isHidden ? setRowsPerPage(10) : setRowsPerPage(17);
              }}
            >
              {isHidden ? "Show deals" : "Hide deals"}
            </button>
          </div>
          <DataTable
            columns={dealsColumns({
              handleEditOrder,
              handleCloseOrder,
              showColumns: showDealsColumns,
            })}
            data={fillArrayWithEmptyRows(deals, 5)}
            pagination
            paginationPerPage={5}
            // paginationRowsPerPageOptions={[5, 10, 20, 50]}
            paginationComponentOptions={{
              noRowsPerPage: 1,
            }}
            paginationTotalRows={deals.length}
            highlightOnHover
            pointerOnHover
            onRowClicked={(row) => row && setSelectedOrder(row)}
            onRowDoubleClicked={() => setShowNewOrderModal(true)}
            dense
            customStyles={{
              table: {
                style: {
                  display: isHidden ? "none" : "",
                },
              },
              pagination: {
                style: {
                  fontSize: "1rem",
                  minHeight: 26,
                  height: 26,
                  display: isHidden ? "none" : "",
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
                  minHeight: "auto !important",
                  height: 27,
                },
              },
            }}
            conditionalRowStyles={[
              {
                when: (row) => row && row.id === selectedOrder?.id,
                style: {
                  backgroundColor: "#D1FFBD",
                  userSelect: "none",
                },
              },
            ]}
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
      {showNewOrderModal && (
        <NewOrder
          onClose={() => setShowNewOrderModal(false)}
          selectedOrder={selectedOrder}
        />
      )}
      {showColumnsModal && (
        <SelectColumnsModal
          columnKey={
            showColumnsModal === "deals" ? "dealsColumns" : "playersColumns"
          }
          setModal={setShowColumnsModal}
          columns={
            showColumnsModal === "deals" ? showDealsColumns : showPlayersColumns
          }
          setColumns={
            showColumnsModal === "deals"
              ? setShowDealsColumns
              : setShowPlayersColumns
          }
          position={
            showColumnsModal === "deals" ? "deals-columns" : "players-columns"
          }
        />
      )}
    </>
  );
}
