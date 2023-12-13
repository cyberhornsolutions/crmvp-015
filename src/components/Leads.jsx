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
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Dropdown, Modal, ProgressBar } from "react-bootstrap";
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
import { addUserNewBalance } from "../utills/firebaseHelpers";
import { setUserOrders } from "../redux/slicer/orderSlicer";
import { useDispatch, useSelector } from "react-redux";
export default function Leads({ setTab }) {
  const userOrders = useSelector((state) => state?.userOrders?.orders);
  const [selected, setSelected] = useState();
  const [popup, setPopup] = useState(false);
  const [users, setUsers] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [selectedOrder, setSelectedOrder] = useState();
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [userProfit, setUserProfit] = useState(0);
  const [isBalanceModal, setIsBalanceModal] = useState(false);
  const [newBalance, setNewBalance] = useState(0);
  const [unsub, setUnsub] = useState();
  const navigate = useNavigate();
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

  const handleDelModal = () => {
    setIsDelModalOpen(true);
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userData = [];

      querySnapshot.forEach((doc) => {
        userData.push({ id: doc.id, ...doc.data() });
      });

      setUsers(userData);
      setStatusUpdate(false);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const showOnline = async () => {
    setIsOnline(true);
    const result = users.filter((el) => el.onlineStatus == true);
    setUsers(result);
  };

  useEffect(() => {
    if (isOnline == false) {
      fetchUsers();
    }
  }, [statusUpdate, isOnline]);

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
        console.log("snap", orders);
        // setOrdersData(orders);
        console.log("SET ORDER DATA HAS BEEN CALLED");
        let profit = 0;
        orders?.map((el) => {
          if (
            el.status.toLocaleLowerCase() == "success" ||
            el.status.toLocaleLowerCase() == "closed"
          ) {
            profit = profit + parseFloat(el.profit);
          }

          setUserProfit(profit);
        });

        // setOrdersData(orders);
        if (isOk === true) {
          isOk = false;
          navigate("/home/mainBoard", {
            state: { state: orders, user: row, profit: userProfit },
          });
        }
      });
      setSelectedUser(row);
      setSelected(row?.id);

      // Return a cleanup function to unsubscribe when the component unmounts
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
      selector: (row) => row.id,
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

              handleDelModal();
            }}
          >
            <FontAwesomeIcon icon={faClose} />
          </div>
        </div>
      ),
      sortable: true,
    },
  ];

  const data = userOrders?.map((order, i) => ({
    id: i + 1,
    index: i + 1,
    docId: order.id,
    type: order?.type,
    symbol: order?.symbol,
    sum: order?.volume,
    price: order?.symbolValue,
    profit: order?.profit,
    createdAt: order?.createdAt,
    createdTime: order.createdTime,
    sl: order.sl,
    tp: order.tp,
    userId: order.userId,
    status: order.status,
    orderId: order.id,
    closedPrice: order?.closedPrice,
  }));

  const onUserRowClick = (row) => {
    fetchOrders(row, false);
    const newUsers = users.map((el) => {
      if (el.id == row.id) {
        return { ...el, isSelected: true };
      } else {
        return { ...el, isSelected: false };
      }
    });
    setUsers(newUsers);
  };

  const onUserDoubleClick = async (row) => {
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
        <div className="d-flex">
          {row.onlineStatus ? (
            <CircleIcon className="onlineGreen" />
          ) : (
            <CircleIcon className="onlineRed" />
          )}
          <p>{row.id}</p>
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
            setSelectedUser(row);
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
      when: (row) => row.isSelected,
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
  const handleClose = () => {
    setIsBalanceModal(false);
    setSelectedUser({});
  };
  const addNewBalance = async (amount) => {
    await addUserNewBalance(selectedUser.id, amount);
    setNewBalance(0);
    setIsBalanceModal(false);
    setSelectedUser({});
    fetchUsers();
  };
  //console.log(data, 9080);

  return (
    <>
      <div id="leads" className="active">
        <div id="leads-div">
          <div className="dropdown">
            <select className="btn dropdown-toggle">
              <option
                className="dropdown-item text-center"
                style={{ display: "none" }}
              >
                Search
              </option>

              <option
                className="dropdown-item text-center"
                href="#"
                data-option="By name"
              >
                By name
              </option>
              <option
                className="dropdown-item text-center"
                href="#"
                data-option="By phone"
              >
                By phone
              </option>
              <option
                className="dropdown-item text-center"
                href="#"
                data-option="By email"
              >
                By email
              </option>
            </select>
            <div className="show_all">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsOnline(false);
                  fetchUsers();
                }}
              >
                Show All
              </button>
            </div>
            <div className="search_div">
              <button
                className="btn btn-secondary show_online"
                onClick={() => {
                  showOnline();
                }}
              >
                Show Online
              </button>
              <input
                type="text"
                id="leadsSearchInput"
                onKeyUp="leadsSearch()"
                placeholder="Search.."
              />
            </div>
          </div>
          <div className="">
            <DataTable
              columns={userColumns}
              data={users}
              highlightOnHover
              pointerOnHover
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 20, 50]}
              conditionalRowStyles={conditionalRowStyles}
              onRowClicked={onUserRowClick}
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
              data={data}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 50]}
              highlightOnHover
              pointerOnHover
            />
          </div>
        </div>
      </div>
      <Modal show={isBalanceModal} onHide={handleClose}>
        <Modal.Header closeButton>Add Balance</Modal.Header>
        <Modal.Body>
          <input
            type="number"
            className="form-control "
            placeholder="Enter new balance"
            value={newBalance}
            onChange={(e) => {
              setNewBalance(e.target.value);
            }}
          />
          <button
            className="btn btn-primary mt-3"
            onClick={() => {
              if (!newBalance) {
                toast.error("Please enter amount");
              } else {
                addNewBalance(newBalance);
              }
            }}
          >
            Add Balance
          </button>
        </Modal.Body>
      </Modal>

      {isDelModalOpen && (
        <DelOrderModal
          show={isDelModalOpen}
          onClose={handleCloseModal}
          selectedOrder={selectedOrder}
          isMain={false}
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
