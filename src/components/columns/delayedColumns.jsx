import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faEdit,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { convertTimestamptToDate } from "../../utills/helpers";

const delayedColumns = ({ handleEditOrder, handleCloseOrder }) => [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
    sortable: true,
    width: "70px",
  },
  {
    name: "Date",
    selector: (row) =>
      row.createdTime && convertTimestamptToDate(row.createdTime),
    sortable: true,
    compact: true,
    minWidth: "180px",
  },
  {
    name: "Symbol",
    selector: (row) => row.symbol,
    sortable: true,
    minWidth: "fit-content",
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
      `${+parseFloat(row.sl)?.toFixed(6) || ""}/${
        +parseFloat(row.tp)?.toFixed(6) || ""
      }`,
    minWidth: "180px",
  },
  {
    name: "Additional parameters",
    selector: (row) =>
      row &&
      `Spread: ${+parseFloat(row.spread)?.toFixed(4)}/Swap: ${+parseFloat(
        row.swap
      )?.toFixed(4)}/Fee: ${+parseFloat(row.fee)?.toFixed(4)}`,
    minWidth: "320px",
    compact: true,
    sortable: true,
  },
  {
    name: "Pledge",
    selector: (row) => row && +parseFloat(row.pledge)?.toFixed(6),
    sortable: true,
    minWidth: "120px",
  },
  {
    name: "Current Price",
    selector: (row) => row && +parseFloat(row.currentPrice)?.toFixed(6),
    sortable: true,
    compact: true,
    minWidth: "120px",
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

export default delayedColumns;
