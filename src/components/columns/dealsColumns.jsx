import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faEdit,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { convertTimestamptToDate, calculateProfit } from "../../utills/helpers";

const dealsColumns = ({ handleEditOrder, handleCloseOrder }) => [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
    sortable: true,
    grow: 0.5,
  },
  {
    name: "Date",
    selector: (row) =>
      row.createdTime && convertTimestamptToDate(row.createdTime),
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
    selector: (row) => row && +parseFloat(row.volume)?.toFixed(6),
    sortable: true,
    compact: true,
  },
  {
    name: "Open Price",
    selector: (row) => row && +parseFloat(row.symbolValue)?.toFixed(6),
    sortable: true,
    compact: true,
  },
  {
    name: "SL / TP",
    selector: (row) =>
      row &&
      `${+parseFloat(row.sl)?.toFixed(4) || ""}/${
        +parseFloat(row.tp)?.toFixed(4) || ""
      }`,
    grow: 2,
  },
  {
    name: "Additional parameters",
    selector: (row) =>
      row &&
      `${+parseFloat(row.pledge)?.toFixed(4)}/${+parseFloat(
        row.spread
      )?.toFixed(4)}/${+parseFloat(row.swap)?.toFixed(4)}/${+parseFloat(
        row.fee
      )?.toFixed(4)}`,
    grow: 3,
    compact: true,
    sortable: true,
  },
  {
    name: "Current Price",
    selector: (row) => row && +parseFloat(row.currentPrice)?.toFixed(6),
    sortable: true,
    grow: 1.5,
  },
  {
    name: "Profit",
    selector: (row) =>
      row && (
        <div style={{ color: `${row.profit < 0 ? "red" : "green"}` }}>
          {+parseFloat(row.profit).toFixed(6)}
        </div>
      ),
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
