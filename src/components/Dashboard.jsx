import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { fillArrayWithEmptyRows } from "../utills/helpers";
import depositsColumns from "./columns/depositsColumns";
import DataTable from "react-data-table-component";

export default function Dashboard() {
  const allTransaction = useSelector((state) =>
    state.deposits.filter(({ manager }) => manager === state.user.user.username)
  );

  const deposits = allTransaction.filter(({ type }) => type === "Deposit");

  const todayDeposits = [],
    thisMonthDeposits = [];
  deposits.forEach((deposit) => {
    if (moment(deposit.createdAt).diff(moment(), "day") === 0)
      todayDeposits.push(deposit);
    if (moment(deposit.createdAt).diff(moment(), "month") === 0)
      thisMonthDeposits.push(deposit);
  });

  return (
    <div id="dashboard">
      <div id="cards">
        <div className="card-item">
          <h5>Today</h5>
          <h6>{todayDeposits.length}</h6>
        </div>
        <div className="card-item">
          <h5>Month</h5>
          <h6>{thisMonthDeposits.length}</h6>
        </div>
        <div className="card-item">
          <h5>Total</h5>
          <h6>{deposits.length}</h6>
        </div>
        <div className="card-item">
          <h5>Today</h5>
          <h6>${todayDeposits.reduce((p, { sum }) => p + sum, 0)} </h6>
        </div>
        <div className="card-item">
          <h5>Month</h5>
          <h6>${thisMonthDeposits.reduce((p, { sum }) => p + sum, 0)}</h6>
        </div>
        <div className="card-item">
          <h5>Total</h5>
          <h6>${deposits.reduce((p, { sum }) => p + sum, 0)}</h6>
        </div>
      </div>
      <div id="details">
        <div className="details-item">
          <h5>Reminders</h5>
          <DataTable
            columns={depositsColumns}
            data={fillArrayWithEmptyRows([], 10)}
            highlightOnHover
            // pointerOnHover
            pagination
            // paginationTotalRows={0}
            paginationPerPage={10}
            // paginationRowsPerPageOptions={[5, 10, 20, 50]}
            striped
            // dense
            // responsive
            paginationComponentOptions={{
              noRowsPerPage: 1,
            }}
            dense
            customStyles={{
              pagination: {
                style: {
                  minHeight: 28,
                  height: 28,
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
                },
              },
            }}
          />
        </div>
        <div className="details-item">
          <h5>Latest actions</h5>
          <DataTable
            columns={depositsColumns}
            data={fillArrayWithEmptyRows(allTransaction, 10)}
            highlightOnHover
            // pointerOnHover
            pagination
            paginationTotalRows={allTransaction.length}
            paginationPerPage={10}
            // paginationRowsPerPageOptions={[5, 10, 20, 50]}
            striped
            dense
            // responsive
            paginationComponentOptions={{
              noRowsPerPage: 1,
            }}
            customStyles={{
              pagination: {
                style: {
                  minHeight: 28,
                  height: 28,
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
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
