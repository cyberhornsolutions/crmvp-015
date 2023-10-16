import React, { useState } from "react";

export default function Leads({ setTab }) {
  const [selected, setSelected] = useState();
  const [popup, setPopup] = useState(false);
  const [users, setUsers] = useState([
    {
      registered: new Date(),
      name: "Mark Otto	",
      sale: "New",
      reten: "New",
      phone: "12312321",
      email: "test@gmail.com",
      balance: 100,
      deposit: 50,
      manager: "John",
      affiliates: "Candy Land",
    },
    {
      registered: new Date(),
      name: "Jane Doe	",
      sale: "New",
      reten: "New",
      phone: "12312321",
      email: "test@gmail.com",
      balance: 100,
      deposit: 50,
      manager: "John",
      affiliates: "Candy Land",
    },
    {
      registered: new Date(),
      name: "Alice Johnson	",
      sale: "New",
      reten: "New",
      phone: "12312321",
      email: "test@gmail.com",
      balance: 100,
      deposit: 50,
      manager: "John",
      affiliates: "Candy Land",
    },
    {
      registered: new Date(),
      name: "Michael Smith	",
      sale: "New",
      reten: "New",
      phone: "12312321",
      email: "test@gmail.com",
      balance: 100,
      deposit: 50,
      manager: "John",
      affiliates: "Candy Land",
    },
    {
      registered: new Date(),
      name: "Susan Lee	",
      sale: "New",
      reten: "New",
      phone: "12312321",
      email: "test@gmail.com",
      balance: 100,
      deposit: 50,
      manager: "John",
      affiliates: "Candy Land",
    },
    {
      registered: new Date(),
      name: "David Brown	",
      sale: "New",
      reten: "New",
      phone: "12312321",
      email: "test@gmail.com",
      balance: 100,
      deposit: 50,
      manager: "John",
      affiliates: "Candy Land",
    },
    {
      registered: new Date(),
      name: "Lisa Johnson	",
      sale: "New",
      reten: "New",
      phone: "12312321",
      email: "test@gmail.com",
      balance: 100,
      deposit: 50,
      manager: "John",
      affiliates: "Candy Land",
    },
    {
      registered: new Date(),
      name: "John Smith	",
      sale: "New",
      reten: "New",
      phone: "12312321",
      email: "test@gmail.com",
      balance: 100,
      deposit: 50,
      manager: "John",
      affiliates: "Candy Land",
    },
    {
      registered: new Date(),
      name: "Mary Taylor	",
      sale: "New",
      reten: "New",
      phone: "12312321",
      email: "test@gmail.com",
      balance: 100,
      deposit: 50,
      manager: "John",
      affiliates: "Candy Land",
    },
    {
      registered: new Date(),
      name: "Robert Anderson	",
      sale: "New",
      reten: "New",
      phone: "12312321",
      email: "test@gmail.com",
      balance: 100,
      deposit: 50,
      manager: "John",
      affiliates: "Candy Land",
    },
  ]);
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
        <table id="leadsTable" className="table table-hover table-striped">
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
              <th scope="col" className="text-center">
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
              <tr onClick={() => setSelected(e.name)}>
                <td>{i + 1}</td>
                <td>{new Date(e.registered).toLocaleDateString()}</td>
                <td>{e.name}</td>
                <td>{e.sale}</td>
                <td>{e.reten}</td>
                <td>{e.phone}</td>
                <td>{e.email}</td>
                <td>{e.balance}</td>
                <td>{e.deposit}</td>
                <td>{e.manager}</td>
                <td>{e.affiliates}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
            onClick={() => setTab("MainBoard")}
          >
            Player card
          </button>
        </div>
        <div id="">
          <table className="table table-hover table-striped">
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
            {selected && (
              <tbody
              // className="hidden"
              >
                <tr>
                  <td>ID123</td>
                  <td>05-05-2023</td>
                  <td>Bitcoin</td>
                  <td>0.2</td>
                  <td>25630.22</td>
                  <td>+120</td>
                  <td>05-05-2023</td>
                </tr>
                <tr>
                  <td>ID11</td>
                  <td>02-05-2023</td>
                  <td>Ethereum</td>
                  <td>0.5</td>
                  <td>1590.22</td>
                  <td>-24.22</td>
                  <td>06-05-2023</td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
