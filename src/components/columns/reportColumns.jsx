import { convertTimestamptToDate } from "../../utills/helpers";

const reportColumns = [
  { name: "ID", selector: (row) => row.id, width: "200px" },
  {
    name: "Open date",
    selector: (row) =>
      row.createdTime && convertTimestamptToDate(row.createdTime),
    width: "175px",
  },
  { name: "Type", selector: (row) => row.type },
  { name: "Symbol", selector: (row) => row.symbol },
  { name: "Volume", selector: (row) => row.volume },
  {
    id: "close-date",
    name: "Close date",
    selector: (row) =>
      row.closedDate && convertTimestamptToDate(row?.closedDate),
    width: "175px",
  },
  { name: "Open price", selector: (row) => row && +row?.symbolValue },
  { name: "Close price", selector: (row) => row?.closedPrice },
  { name: "TP", selector: (row) => row.tp },
  { name: "SL", selector: (row) => row.sl },
  {
    name: "Spread",
    selector: (row) => row && +parseFloat(row.spread)?.toFixed(6),
  },
  {
    name: "Swap",
    selector: (row) => row && +parseFloat(row.swap)?.toFixed(4),
  },
  { name: "Fee", selector: (row) => row.fee },
  {
    name: "Profit",
    selector: (row) =>
      row && (
        <div
          className={
            row.profit < 0
              ? "text-danger"
              : row.profit > 0
              ? "text-success"
              : ""
          }
        >
          {row.profit}
        </div>
      ),
  },
  { name: "Balance", selector: (row) => row.balance },
  {
    name: "Status",
    selector: (row) => (
      <div
        className={`order-column ${
          row.status == "Success"
            ? "text-success"
            : row.status == "Closed"
            ? "text-danger"
            : "text-warning"
        } `}
      >
        {row.status}
      </div>
    ),
  },
];

export default reportColumns;
