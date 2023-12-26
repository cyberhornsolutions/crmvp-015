import React, { useEffect, useState } from "react";
import transactionsColumns from "./columns/transactionsColumns";
import DataTable from "react-data-table-component";
import { filterSearchObjects } from "../utills/helpers";
import { getAllDeposits } from "../utills/firebaseHelpers";

export default function Transactions() {
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return getAllDeposits(setDeposits, setLoading);
  }, []);

  const filteredTransactions = searchText
    ? filterSearchObjects(searchText, deposits)
    : deposits;

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
            {transactionsColumns.map(({ name }, i) => (
              <option key={i} className="dropdown-item">
                {name}
              </option>
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
          progressPending={loading}
        />
      </div>
    </div>
  );
}
