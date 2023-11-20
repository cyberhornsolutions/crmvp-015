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
} from "firebase/firestore";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Dropdown, ProgressBar } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faClose } from "@fortawesome/free-solid-svg-icons";
import DelOrderModal from "./DelOrderModal";

export default function Leads({ setTab }) {
  const [selected, setSelected] = useState();
  const [popup, setPopup] = useState(false);
  const [users, setUsers] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const navigate = useNavigate();

  const progressBarConfig = {
    New: { variant: "success", now: 25 },
    InProgress: { variant: "info", now: 50 },
    Confirmed: { variant: "warning", now: 75 },
    Closed: { variant: "danger", now: 100 },
  };
  const handleCloseModal = () => {
    console.log("hhhhhhh");
    setIsDelModalOpen(false);
  };
  const handleDelModal = () => {
    setIsDelModalOpen(true);
  };
  console.log("OrdersData", ordersData);

  console.log("Users:", users);

  useEffect(() => {
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

    fetchUsers();
  }, [statusUpdate]);

  const fetchOrders = async (row) => {
    console.log("UserId", row?.id);
    try {
      const q = query(collection(db, "orders"), where("userId", "==", row?.id));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const orders = [];
        querySnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        setOrdersData(orders);
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
          <div className="custom-edit-icon" onClick={() => {}}>
            <FontAwesomeIcon icon={faEdit} />
          </div>
          <div
            style={{ marginLeft: "10px" }}
            className="custom-delete-icon"
            onClick={() => {
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

  const data = ordersData?.map((order, i) => ({
    id: i + 1,
    type: order?.type,
    symbol: order?.symbol,
    sum: order?.volume,
    price: order?.symbolValue,
    profit: order?.profit,
    createdAt: order?.createdAt,
  }));

  const userColumns = [
    {
      name: "ID",
      selector: (row) => (
        <div className="online-container">
          <div className="status"></div>
          <div>{row.id}</div>
        </div>
      ),
      sortable: false,
    },
    {
      name: "Registered",
      selector: (row) => row.createdAt,
      sortable: true,
    },
    {
      name: "Name",
      cell: (row) => (
        <div
          onClick={() => fetchOrders(row)}
          onDoubleClick={async () => {
            await fetchOrders(row.id);
            navigate("/home/mainBoard", { state: ordersData });
          }}
        >
          {row.surname === undefined ? row.name : row.name + " " + row.surname}
        </div>
      ),
      sortable: true,
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
      sortable: true,
    },
    {
      name: "Reten",
      selector: (row) => (row.reten ? row.reten : "New"),
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => (row.phone ? row.phone : "12312321"),
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Balance",
      selector: (row) => row.totalBalance,
      sortable: true,
    },
    {
      name: "Deposit",
      selector: (row) => (row.deposit ? row.deposit : "50"),
      sortable: true,
    },
    {
      name: "Manager",
      selector: (row) => (row.manager ? row.manager : "Jhon"),
      sortable: true,
    },
    {
      name: "Affiliates",
      selector: (row) => (row.affiliates ? row.affiliates : "Candy Land"),
      sortable: true,
    },
  ];

  const mappedData = users?.map((user, i) => ({
    ...user,
    status: user?.status,
    id: user?.id,
  }));
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
              <button className="btn btn-secondary">Show All</button>
            </div>
            <div className="search_div">
              <button className="btn btn-secondary show_online">
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
              data={mappedData}
              highlightOnHover
              pointerOnHover
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 20, 50]}
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

            <button
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
            </button>
          </div>
          <div>
            <DataTable
              columns={columns}
              data={data}
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 20, 50]}
              highlightOnHover
              pointerOnHover
            />
          </div>
        </div>
      </div>
      {isDelModalOpen && (
        <DelOrderModal show={isDelModalOpen} onClose={handleCloseModal} />
      )}
    </>
  );
}
