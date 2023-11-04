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

export default function Leads({ setTab }) {
  const [selected, setSelected] = useState();
  const [popup, setPopup] = useState(false);
  const [users, setUsers] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState(false);
  const navigate = useNavigate();

  const progressBarConfig = {
    New: { variant: "success", now: 25 },
    InProgress: { variant: "info", now: 50 },
    Confirmed: { variant: "warning", now: 75 },
    Closed: { variant: "danger", now: 100 },
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

  const fetchOrders = async (userId) => {
    console.log("UserId", userId);
    try {
      const q = query(collection(db, "orders"), where("userId", "==", userId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const orders = [];
        querySnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        setOrdersData(orders);
      });

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
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Registered",
      selector: (row) => row.createdAt,
      sortable: true,
    },
    {
      name: "Name",
      cell: (row) => (
        <div onClick={() => fetchOrders(row.id)}>
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

  // const [users, setUsers] = useState([
  //   {
  //     registered: new Date(),
  //     name: "Mark Otto	",
  //     sale: "New",
  //     reten: "New",
  //     phone: "12312321",
  //     email: "test@gmail.com",
  //     balance: 100,
  //     deposit: 50,
  //     manager: "John",
  //     affiliates: "Candy Land",
  //   },
  //   {
  //     registered: new Date(),
  //     name: "Jane Doe	",
  //     sale: "New",
  //     reten: "New",
  //     phone: "12312321",
  //     email: "test@gmail.com",
  //     balance: 100,
  //     deposit: 50,
  //     manager: "John",
  //     affiliates: "Candy Land",
  //   },
  //   {
  //     registered: new Date(),
  //     name: "Alice Johnson	",
  //     sale: "New",
  //     reten: "New",
  //     phone: "12312321",
  //     email: "test@gmail.com",
  //     balance: 100,
  //     deposit: 50,
  //     manager: "John",
  //     affiliates: "Candy Land",
  //   },
  //   {
  //     registered: new Date(),
  //     name: "Michael Smith	",
  //     sale: "New",
  //     reten: "New",
  //     phone: "12312321",
  //     email: "test@gmail.com",
  //     balance: 100,
  //     deposit: 50,
  //     manager: "John",
  //     affiliates: "Candy Land",
  //   },
  //   {
  //     registered: new Date(),
  //     name: "Susan Lee	",
  //     sale: "New",
  //     reten: "New",
  //     phone: "12312321",
  //     email: "test@gmail.com",
  //     balance: 100,
  //     deposit: 50,
  //     manager: "John",
  //     affiliates: "Candy Land",
  //   },
  //   {
  //     registered: new Date(),
  //     name: "David Brown	",
  //     sale: "New",
  //     reten: "New",
  //     phone: "12312321",
  //     email: "test@gmail.com",
  //     balance: 100,
  //     deposit: 50,
  //     manager: "John",
  //     affiliates: "Candy Land",
  //   },
  //   {
  //     registered: new Date(),
  //     name: "Lisa Johnson	",
  //     sale: "New",
  //     reten: "New",
  //     phone: "12312321",
  //     email: "test@gmail.com",
  //     balance: 100,
  //     deposit: 50,
  //     manager: "John",
  //     affiliates: "Candy Land",
  //   },
  //   {
  //     registered: new Date(),
  //     name: "John Smith	",
  //     sale: "New",
  //     reten: "New",
  //     phone: "12312321",
  //     email: "test@gmail.com",
  //     balance: 100,
  //     deposit: 50,
  //     manager: "John",
  //     affiliates: "Candy Land",
  //   },
  //   {
  //     registered: new Date(),
  //     name: "Mary Taylor	",
  //     sale: "New",
  //     reten: "New",
  //     phone: "12312321",
  //     email: "test@gmail.com",
  //     balance: 100,
  //     deposit: 50,
  //     manager: "John",
  //     affiliates: "Candy Land",
  //   },
  //   {
  //     registered: new Date(),
  //     name: "Robert Anderson	",
  //     sale: "New",
  //     reten: "New",
  //     phone: "12312321",
  //     email: "test@gmail.com",
  //     balance: 100,
  //     deposit: 50,
  //     manager: "John",
  //     affiliates: "Candy Land",
  //   },
  // ]);
  return (
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
          <input
            type="text"
            id="leadsSearchInput"
            onKeyUp="leadsSearch()"
            placeholder="Search.."
          />
        </div>
        <div className="">
          <DataTable
            // title="User Data"
            columns={userColumns}
            data={mappedData}
            highlightOnHover
            pointerOnHover
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10]}
            // responsive
          />
        </div>
        {/* <table id="leadsTable" className="table table-hover table-striped">
          <thead>
            <tr>
              <th scope="col" className="text-center">
                ID
              </th>
              <th scope="col" className="text-center">
                Registered
              </th>
              <th scope="col" className="text-center">
                Name
              </th>
              <th scope="col" className="text-center">
                Status
              </th>
              <th scope="col" className="text-center">
                Sale
              </th>
              <th scope="col" className="text-center">
                Reten
              </th>
              <th scope="col" className="text-center">
                Phone
              </th>
              <th scope="col" className="text-center">
                Email
              </th>
              <th scope="col" className="text-center">
                Balance
              </th>
              <th scope="col" clatab-contentssName="text-center">
                Deposit
              </th>
              <th scope="col" className="text-center">
                Manager
              </th>
              <th scope="col" className="text-center">
                Affiliates
              </th>
            </tr>
          </thead>
          <tbody>
            {users?.map((e, i) => (
              <tr onClick={() => fetchOrders(e?.id)}>
                <td>{i + 1}</td>
                <td>{e?.createdAt}</td>
                <td>
                  {e?.surname === undefined
                    ? e?.name
                    : e?.name + " " + e?.surname}
                </td>
                <td>
                  <Dropdown data-bs-theme="light" className="custom-dropdown">
                    <Dropdown.Toggle variant="none" id="dropdown-basic">
                      {e?.status && progressBarConfig[e.status] && (
                        <ProgressBar
                          variant={progressBarConfig[e.status].variant}
                          now={progressBarConfig[e.status].now}
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
                          onClick={() => handleDropdownItemClick(status, e?.id)}
                          className={
                            e?.status === status ? "active-status" : ""
                          }
                        >
                          {e?.status === status ? <span>&#10004;</span> : " "}{" "}
                          {status}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </td>

                <td>{e?.sale}</td>
                <td>{e?.reten}</td>
                <td>{e?.phone}</td>
                <td>{e?.email}</td>
                <td>{e?.balance}</td>
                <td>{e?.deposit}</td>
                <td>{e?.manager}</td>
                <td>{e?.affiliates}</td>
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
      <div
        id="lead-transactions"
        // className="hidden"
      >
        <div
          id="lead-transactions-header"
          className="lead-transactions-header-height"
        >
          <h2>Deals</h2>
          <h2 id="lead-transactions-name">{selected}</h2>

          <button
            id="lead-card-button"
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/home/mainBoard", { state: ordersData })}
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
            paginationRowsPerPageOptions={[5, 10]}
            highlightOnHover
            pointerOnHover
            // responsive
          />
          {/* <table className="table table-hover table-striped">
            <thead>
              <tr>
                <th className="text-center" scope="col">
                  ID
                </th>
                <th className="text-center" scope="col">
                  Type
                </th>
                <th className="text-center" scope="col">
                  Symbol
                </th>
                <th className="text-center" scope="col">
                  Sum
                </th>
                <th className="text-center" scope="col">
                  Price
                </th>
                <th className="text-center" scope="col">
                  Profit
                </th>
                <th className="text-center" scope="col">
                  Date
                </th>
              </tr>
            </thead>
            {ordersData && (
              <tbody
              // className="hidden"
              >
                {ordersData?.map((order, i) => (
                  <tr>
                    <td>{i + 1}</td>
                    <td>{order?.type}</td>
                    <td>{order?.symbol}</td>
                    <td>{order?.volume}</td>
                    <td>{order?.symbolValue}</td>
                    <td>{order?.profit}</td>
                    <td>{order?.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table> */}
        </div>
      </div>
    </div>
  );
}
