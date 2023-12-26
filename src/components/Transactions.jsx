import React, { useEffect, useState } from "react";
import transactionsColumns from "./columns/transactionsColumns";
import DataTable from "react-data-table-component";
import { filterSearchObjects } from "../utills/helpers";

const transactionData = [
  {
    id: 1,
    player: "Mark Otto",
    type: "Deposit",
    sum: 100,
    method: "VISA",
    card: "0000111100001111",
    status: "Success",
    manager: "Manager #1",
    team: "Test",
    desk: "Desk #1",
    date: new Date(),
    ftd: "Yes",
  },
  {
    id: 1,
    player: "John Doe",
    type: "Withdrawal",
    sum: 100,
    method: "VISA",
    card: "0000111100001111",
    status: "Success",
    manager: "Manager #1",
    team: "Test",
    desk: "Desk #1",
    date: new Date(),
    ftd: "No",
  },
];

export default function Transactions() {
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("");

  const filteredTransactions = searchText
    ? filterSearchObjects(searchText, transactionData)
    : transactionData;
  return (
    <div id="transactions" className="active">
      <div id="transactions-div">
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
            {transactionsColumns.map(({ name }) => (
              <option className="dropdown-item">{name}</option>
            ))}
          </select>
          <input
            className="form-control-sm w-25"
            type="search"
            autoComplete="off"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search.."
          />
        </div>
        <DataTable
          data={filteredTransactions}
          columns={transactionsColumns}
          pagination
        />
      </div>
    </div>
  );
}
