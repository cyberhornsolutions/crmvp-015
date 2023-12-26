import React, { useEffect, useState } from "react";
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
import DelOrderModal from "./DelOrderModal";
import CircleIcon from "@mui/icons-material/Circle";
import EditOrder from "./EditOrder";
import { getUserById, fetchPlayers } from "../utills/firebaseHelpers";
import { setUserOrders } from "../redux/slicer/orderSlicer";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/slicer/userSlice";
import AddBalanceModal from "./AddBalanceModal";
export default function Leads({ setTab }) {
  const userOrders = useSelector((state) => state?.userOrders?.orders);
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const [selected, setSelected] = useState();
  const [users, setUsers] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState();
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isBalanceModal, setIsBalanceModal] = useState(false);
  const dispatch = useDispatch();
  const progressBarConfig = {
    New: { variant: "success", now: 25 },
    InProgress: { variant: "info", now: 50 },
    Confirmed: { variant: "warning", now: 75 },
    Closed: { variant: "danger", now: 100 },
  };
  const handleCloseModal = () => {
    setIsDelModalOpen(false);
    setIsEdit(false);
  };

  const filteredUsers = isOnline
    ? users.filter((el) => el.onlineStatus == true)
    : users;

  useEffect(() => {
    return fetchPlayers(setUsers, setLoading);
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
        let profit = 0;
        orders?.map((el) => {
          if (
            el.status.toLocaleLowerCase() == "success" ||
            el.status.toLocaleLowerCase() == "closed"
          ) {
            profit = profit + parseFloat(el.profit);
          }
        });
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

  const columns = [
    {
      name: "ID",
      selector: (row, i) => i + 1,
      sortable: true,
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
    },
    {
      name: "Symbol",
      selector: (row) => row.symbol,
      sortable: true,
    },
    {
      name: "Sum",
      selector: (row) => row.sum,
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
    },
    {
      name: "Profit",
      selector: (row) => row.profit,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.createdAt,
      sortable: true,
    },
    {
      name: "",
      selector: (row) => (
        <div className="order-actions">
          <div
            className="custom-edit-icon"
            onClick={() => {
              setSelectedOrder(row);
              setIsEdit(true);
            }}
          >
            <FontAwesomeIcon icon={faEdit} />
          </div>
          <div
            style={{ marginLeft: "10px" }}
            className="custom-delete-icon"
            onClick={() => {
              setSelectedOrder(row);
              setIsDelModalOpen(true);
            }}
          >
            <FontAwesomeIcon icon={faClose} />
          </div>
        </div>
      ),
      sortable: true,
    },
  ];

  const deals = userOrders
    .filter(({ status }) => status === "Pending")
    .map((order) => ({
      ...order,
      docId: order.id,
      sum: order?.volume,
      price: order?.symbolValue,
      orderId: order.id,
    }));

  const onUserDoubleClick = async (row) => {
    const u = await getUserById(row.id);
    dispatch(setSelectedUser(u));
    await fetchOrders(row, true);
  };
  const userColumns = [
    {
      name: "",
      selector: "",
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.checked}
          // onChange={() => handleCheckboxChange(row.id)}
        />
      ),
    },
    {
      name: "ID",
      selector: (row) => (
        <div className="d-flex align-items-center">
          {row.onlineStatus ? (
            <CircleIcon className="onlineGreen" />
          ) : (
            <CircleIcon className="onlineRed" />
          )}
          {row.id}
        </div>
      ),
      sortable: false,
    },
    {
      name: "Registered",
      selector: (row) => row.createdAt,
      sortable: false,
    },
    {
      name: "Name",
      cell: (row) =>
        row?.surname === undefined ? row.name : row.name + " " + row.surname,
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
      cell: (row) => (
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
          <Dropdown.Menu className="custom-dropdown-menu" data-bs-theme="dark">
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
    },
    {
      name: "Sale",
      selector: (row) => (row.sale ? row.sale : "New"),
      sortable: false,
    },
    {
      name: "Reten",
      selector: (row) => (row.reten ? row.reten : "New"),
      sortable: false,
    },
    {
      name: "Phone",
      selector: (row) => (row.phone ? row.phone : "12312321"),
      // sortable: false,
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
      // sortable: true,
    },
    {
      name: "Deposit",
      selector: (row) => (row.deposit ? row.deposit : "50"),
      // sortable: true,
    },
    {
      name: "Manager",
      selector: (row) => (row.manager ? row.manager : "Jhon"),
      // sortable: true,
    },
    {
      name: "Affiliates",
      selector: (row) => (row.affiliates ? row.affiliates : "Candy Land"),
      // sortable: true,
    },
    {
      name: "Actions",
      selector: (row) => row.id,
      cell: (row) => (
        <div
          className="text-center w-100 "
          onClick={() => {
            dispatch(setSelectedUser(row));
            setIsBalanceModal(true);
          }}
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </div>
      ),
    },
  ];
  const mappedData = users?.map((user, i) => ({
    ...user,
    status: user?.status,
    id: user?.id,
  }));

  const conditionalRowStyles = [
    {
      when: (row) => row.id === selectedUser?.id,
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
            <div className="input-group input-group-sm w-auto gap-1">
              <select className="input-group-text">
                <option className="d-none">Search</option>
                {userColumns.slice(1).map(({ name }) => (
                  <option className="dropdown-item">{name}</option>
                ))}
              </select>
              <input
                className="form-control-sm"
                type="search"
                placeholder="Search.."
              />
            </div>
            <div className="show_all d-flex gap-2">
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
          <div className="">
            <DataTable
              columns={userColumns}
              data={filteredUsers}
              highlightOnHover
              pointerOnHover
              progressPending={loading}
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 20, 50]}
              conditionalRowStyles={conditionalRowStyles}
              onRowClicked={(row) => fetchOrders(row, false)}
              onRowDoubleClicked={onUserDoubleClick}
              // responsive
            />
          </div>
        </div>
        <div
          id="lead-transactions"
          // className="hidden"
        >
          <div
            id="lead-transactions-header"
            className="lead-transactions-header-height"
          >
            <div style={{ display: "flex" }}>
              <h2>Deals</h2>
              <h2 id="lead-transactions-name">{selected}</h2>
            </div>

            {/* <button
              id="lead-card-button"
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate("/home/mainBoard", {
                  state: { state: ordersData, user: selectedUser },
                })
              }
            >
              Player card
            </button> */}
          </div>
          <div>
            <DataTable
              columns={columns}
              data={loading ? [] : deals}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 50]}
              highlightOnHover
              pointerOnHover
            />
          </div>
        </div>
      </div>
      {isBalanceModal && <AddBalanceModal setShowModal={setIsBalanceModal} />}

      {isDelModalOpen && (
        <DelOrderModal
          onClose={handleCloseModal}
          selectedOrder={selectedOrder}
        />
      )}
      {isEdit && (
        <EditOrder
          show={isEdit}
          onClose={handleCloseModal}
          selectedOrder={selectedOrder}
          fetchOrders={fetchOrders}
          isMain={false}
        />
      )}
    </>
  );
}
