import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faEdit,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  convertTimestamptToDate,
  getBidValue,
  getAskValue,
  calculateProfit,
} from "../../utills/helpers";

const dealsColumns = ({ handleEditOrder, handleCloseOrder }) => [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
    sortable: true,
    grow: 0.5,
  },
  {
    name: "Date",
    selector: (row) => row && convertTimestamptToDate(row.createdTime),
    sortable: true,
    grow: 2.5,
    compact: true,
  },
  {
    name: "Symbol",
    selector: (row) => row.symbol,
    sortable: true,
  },
  {
    name: "Type",
    selector: (row) =>
      row &&
      (row.type == "Buy" ? (
        <div className="d-flex align-items-center gap-1">
          <FontAwesomeIcon icon={faCaretUp} color="lime" />
          {row.type}
        </div>
      ) : (
        <div className="d-flex align-items-center gap-1">
          <FontAwesomeIcon icon={faCaretDown} color="red" />
          {row.type}
        </div>
      )),
    sortable: true,
    compact: true,
  },
  {
    name: "Volume",
    selector: (row) => row && (+row.volume).toFixed(6),
    sortable: true,
    compact: true,
  },
  {
    name: "Open Price",
    selector: (row) => row && (+row.symbolValue).toFixed(6),
    sortable: true,
    compact: true,
  },
  {
    name: "SL / TP",
    selector: (row) => row && `${row.sl || ""}/${row.tp || ""}`,
    grow: 2,
  },
  {
    name: "Additional parameters",
    selector: (row) => {
      if (!row) return;
      let spread = row.sum / 100; // 1% of sum
      if (!Number.isInteger(spread)) spread = spread.toFixed(4);
      const swap = 0.0;
      const fee = spread;
      let pledge = row.sum - spread - swap;
      if (!Number.isInteger(pledge)) pledge = pledge.toFixed(4);
      return `${pledge}/${spread}/${swap}/${+fee}`;
    },
    grow: 3,
    compact: true,
    sortable: true,
  },
  {
    name: "Current Price",
    selector: (row) =>
      row &&
      (row.type === "Buy"
        ? getBidValue(row.currentPrice)
        : getAskValue(row.currentPrice)),
    sortable: true,
    grow: 1.5,
  },
  {
    name: "Profit",
    selector: (row) => {
      if (!row) return;
      const profit = calculateProfit(
        row.type,
        row.currentPrice,
        row.symbolValue,
        row.volume
      );
      return (
        <div style={{ color: `${profit < 0 ? "red" : "green"}` }}>
          {profit.toFixed(6)}
        </div>
      );
    },
    sortable: true,
    compact: true,
  },
  {
    name: "Action",
    selector: (row) => row.id,
    cell: (row) =>
      row && (
        <div className="">
          <FontAwesomeIcon icon={faEdit} onClick={() => handleEditOrder(row)} />
          <FontAwesomeIcon
            icon={faClose}
            className="ms-2"
            onClick={() => handleCloseOrder(row)}
          />
        </div>
      ),
    sortable: false,
    compact: true,
  },
];

export default dealsColumns;
