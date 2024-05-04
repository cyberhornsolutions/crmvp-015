import React, { useEffect, useState, useCallback } from "react";
import transactionsColumns from "./columns/transactionsColumns";
import DataTable from "react-data-table-component";
import { fillArrayWithEmptyRows, filterSearchObjects } from "../utills/helpers";
import { getAllDeposits } from "../utills/firebaseHelpers";
import { setDepositsState } from "../redux/slicer/transactionSlicer";
import { useDispatch, useSelector } from "react-redux";

export default function Transactions() {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const deposits = useSelector((state) => state.deposits);

  const setDeposits = useCallback((data) => {
    dispatch(setDepositsState(data));
  }, []);

  useEffect(() => {
    if (!deposits.length) getAllDeposits(setDeposits);
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
            headCells: {
              style: {
                fontSize: "1rem",
              },
            },
            rows: {
              style: {
                fontSize: "1rem",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
