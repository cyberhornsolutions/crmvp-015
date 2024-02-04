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

  const [details, setDetails] = useState({
    player: "",
    header: "",
    detail: "",
    date: null,
  });
  const [data, setData] = useState([
    {
      player: "Player 1",
      header: "Header 1",
      detail: "Details 1",
      date: new Date(),
      selected: false,
    },
    {
      player: "Player 2",
      header: "Header 2",
      detail: "Details 2",
      date: new Date(),
      selected: false,
    },
    {
      player: "Player 3",
      header: "Header 3",
      detail: "Details 3",
      date: new Date(),
      selected: false,
    },
  ]);

  const addRow = () => {
    let obj = {
      player: details.player,
      header: details.header,
      detail: details.detail,
      date: details.date,
    };
    let _data = [...data, obj];
    setData(_data);
    setDetails({
      player: "",
      header: "",
      detail: "",
      date: null,
    });
  };

  const deleteSelectedRows = () => {
    var table = document.getElementById("reminders-table");
    var checkboxes = table.querySelectorAll(
      'tbody input[type="checkbox"]:checked'
    );
    checkboxes.forEach(function (checkbox) {
      var row = checkbox.closest("tr");
      row.remove();
    });
  };

  useEffect(() => {
    document
      .getElementById("select-all-checkbox")
      .addEventListener("click", function () {
        var checkboxes = document.querySelectorAll(
          "tbody input[type='checkbox']"
        );
        checkboxes.forEach(function (checkbox) {
          checkbox.checked = document.getElementById(
            "select-all-checkbox"
          ).checked;
        });
      });
  }, []);

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
          <div id="reminders">
            <h5>Reminders</h5>
            {/* Form to add a new row */}
            <div id="newrow-form">
              <form id="addRowForm">
                <div id="new-row-form-inputs1">
                  <input
                    type="text"
                    placeholder="Player"
                    id="lead"
                    value={details.player}
                    onChange={(e) =>
                      setDetails({ ...details, player: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    placeholder="Date"
                    id="date"
                    value={details.date}
                    onChange={(e) =>
                      setDetails({ ...details, date: e.target.value })
                    }
                  />
                </div>
                <div id="new-row-form-inputs2">
                  <input
                    type="text"
                    placeholder="Header"
                    id="title"
                    value={details.header}
                    onChange={(e) =>
                      setDetails({ ...details, header: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Details"
                    id="new-row-details"
                    value={details.detail}
                    onChange={(e) =>
                      setDetails({ ...details, detail: e.target.value })
                    }
                  />
                </div>
                {/* Button to delete selected rows */}
                <div id="new-row-buttons">
                  <button
                    className="btn btn-secondary"
                    id="new-row-del"
                    type="button"
                    onClick={deleteSelectedRows}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-secondary"
                    id="new-row-add"
                    type="button"
                    onClick={addRow}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
          <table
            id="reminders-table"
            className="table table-hover table-striped"
          >
            <thead>
              <tr>
                <th className="text-center" scope="col">
                  <input type="checkbox" id="select-all-checkbox" />
                </th>
                <th className="text-center" scope="col">
                  Player
                </th>
                <th className="text-center" scope="col">
                  Date
                </th>
                <th className="text-center" scope="col">
                  Header
                </th>
                <th className="text-center" scope="col">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.map((e, i) => (
                <tr key={i}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>{e.player}</td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>{e.header}</td>
                  <td>{e.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="details-item">
          <h5>Latest actions</h5>
          <DataTable
            columns={depositsColumns}
            data={fillArrayWithEmptyRows(allTransaction, 5)}
            highlightOnHover
            pointerOnHover
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 20, 50]}
            striped
            // dense
            // responsive
          />
        </div>
      </div>
    </div>
  );
}
