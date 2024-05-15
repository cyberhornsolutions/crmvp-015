import moment from "moment/moment";
import { convertTimestamptToDate } from "../../utills/helpers";
import { Timestamp } from "firebase/firestore";

const overviewColumns = ({
  selectedRow = {},
  handleEditOrder,
  showColumns = {},
} = {}) => [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
    sortable: true,
    grow: 0.5,
    omit: !showColumns.ID,
  },
  {
    name: "Transaction Type",
    selector: (row) => row.type,
    sortable: true,
    compact: true,
    omit: !showColumns["Transaction Type"],
  },
  {
    name: "Symbol",
    selector: (row) => row.symbol,
    sortable: true,
    cell: (row) => row.symbol,
    omit: !showColumns.Symbol,
  },
  {
    name: "Volume",
    selector: (row) => row.volume,
    compact: true,
    omit: !showColumns.Volume,
  },
  {
    name: "Sum",
    selector: (row) =>
      row &&
      (row.isEdit ? (
        <input
          type="number"
          className="form-control"
          value={selectedRow.sum}
          onChange={(e) => {
            handleEditOrder(row.id, "sum", e.target.value);
          }}
        />
      ) : (
        +parseFloat(row.sum)?.toFixed(2)
      )),
    sortable: true,
    omit: !showColumns.Sum,
  },
  {
    name: "Open Price",
    selector: (row) =>
      row &&
      (row.isEdit ? (
        <input
          type="number"
          className="form-control"
          value={selectedRow.symbolValue}
          onChange={(e) => {
            handleEditOrder(row.id, "symbolValue", e.target.value);
          }}
        />
      ) : (
        +parseFloat(row.symbolValue)?.toFixed(2)
      )),
    sortable: true,
    grow: 1.5,
    compact: true,
    omit: !showColumns["Open Price"],
  },
  {
    name: "Closed price",
    selector: (row) => row?.closedPrice,
    omit: !showColumns.Symbol,
  },
  { name: "TP", selector: (row) => row.tp, omit: !showColumns.TP },
  { name: "SL", selector: (row) => row.sl, omit: !showColumns.SL },
  {
    name: "Spread",
    selector: (row) => row && +parseFloat(row.spread)?.toFixed(6),
    omit: !showColumns.Spread,
  },
  {
    name: "Swap",
    selector: (row) => row && +parseFloat(row.swap)?.toFixed(4),
    omit: !showColumns.Swap,
  },
  { name: "Fee", selector: (row) => row.fee, omit: !showColumns.Fee },
  {
    name: "Balance",
    selector: (row) => row.balance,
    omit: !showColumns.Balance,
  },
  {
    name: "Profit",
    selector: (row) =>
      row &&
      (row.isEdit ? (
        <input
          type="number"
          className="form-control"
          value={selectedRow.profit}
          onChange={(e) => {
            handleEditOrder(row.id, "profit", e.target.value);
          }}
        />
      ) : (
        <div
          className={
            row.profit > 0
              ? "text-success"
              : row.profit < 0
              ? "text-danger"
              : ""
          }
        >
          {row.profit}
        </div>
      )),
    sortable: true,
    omit: !showColumns.Profit,
  },
  {
    name: "Status",
    selector: (row) =>
      row && (
        <div
          className={
            row.status == "Success"
              ? "text-success"
              : row.status == "Closed"
              ? "text-danger"
              : "text-warning"
          }
        >
          {row.status}
        </div>
      ),
    // (
    //   row.isEdit ? (
    //     <select
    //       className="form-select"
    //       onChange={(e) => {
    //         handleEditOrder(row.id, "status", "Pending");
    //       }}
    //       value={selectedRow.status}
    //     >
    //       <option disabled>{row.status}</option>
    //       <option value="Open">Open</option>
    //     </select>
    //   ) : (
    //     <div
    //       className={
    //         row.status == "Success"
    //           ? "text-success"
    //           : row.status == "Closed"
    //           ? "text-danger"
    //           : "text-warning"
    //       }
    //     >
    //       {row.status}
    //     </div>
    //   )
    // ),
    sortable: true,
    compact: true,
    omit: !showColumns.Status,
  },
  {
    name: "Date",
    selector: (row) => {
      if (!row || !row?.createdTime) return;
      if (row.isEdit && selectedRow.createdTime) {
        const value = moment(
          selectedRow.createdTime.seconds * 1000 +
            selectedRow.createdTime.nanoseconds / 1000000
        ).format("YYYY-MM-DDTHH:mm");
        return (
          <input
            type="datetime-local"
            className="form-control"
            value={value}
            onChange={(e) => {
              console.log("e.target.value", e.target.value);
              handleEditOrder(
                row.id,
                "createdTime",
                Timestamp.fromDate(new Date(e.target.value))
              );
            }}
          />
        );
      }
      return convertTimestamptToDate(row.createdTime);
    },
    grow: 2,
    compact: true,
    omit: !showColumns.Date,
  },
];

export default overviewColumns;
