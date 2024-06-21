import React, { useState } from "react";
import transactionsColumns from "./columns/transactionsColumns";
import DataTable from "react-data-table-component";
import { fillArrayWithEmptyRows, filterSearchObjects } from "../utills/helpers";
import { useSelector } from "react-redux";

export default function Transactions() {
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const managers = useSelector((state) => state.managers);
  const teams = useSelector((state) => state.teams);
  const deposits = useSelector((state) => state.deposits).map((d) => ({
    ...d,
    manager: managers.find((m) => m.id === d.manager)?.username,
    team: teams.find((t) => t.id === d.team)?.name,
  }));

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
          data={fillArrayWithEmptyRows(filteredTransactions, 15)}
          columns={transactionsColumns}
          pagination
          paginationTotalRows={deposits.length}
          highlightOnHover
          // pointerOnHover
          paginationPerPage={15}
          // paginationRowsPerPageOptions={[5, 10, 20, 50]}
          // dense
          paginationComponentOptions={{
            noRowsPerPage: 1,
          }}
          customStyles={{
            pagination: {
              style: {
                fontSize: "1rem",
                // minHeight: 38,
                // height: 38,
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
                minHeight: 36,
                height: 36,
              },
            },
          }}
        />
      </div>
    </div>
  );
}
