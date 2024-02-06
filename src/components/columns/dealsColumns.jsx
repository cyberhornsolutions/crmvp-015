import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faEdit,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { convertTimestamptToDate } from "../../utills/helpers";

const dealsColumns = ({
  handleEditOrder,
  handleCloseOrder,
  hideColumns = {},
} = {}) => [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
    sortable: true,
    width: "70px",
    omit: !hideColumns.ID,
  },
  {
    name: "Date",
    selector: (row) =>
      row.createdTime && convertTimestamptToDate(row.createdTime),
    sortable: true,
    compact: true,
    minWidth: "180px",
    omit: !hideColumns.Date,
  },
  {
    name: "Symbol",
    selector: (row) => row.symbol,
    sortable: true,
    minWidth: "fit-content",
    omit: !hideColumns.Symbol,
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
    omit: !hideColumns.Type,
  },
  {
    name: "Volume",
    selector: (row) => row && +parseFloat(row.volume)?.toFixed(6),
    sortable: true,
    compact: true,
    omit: !hideColumns.Volume,
  },
  {
    name: "Open Price",
    selector: (row) => row && +parseFloat(row.symbolValue)?.toFixed(6),
    sortable: true,
    compact: true,
    omit: !hideColumns["Open Price"],
  },
  {
    name: "SL / TP",
    selector: (row) =>
      row &&
      `${+parseFloat(row.sl)?.toFixed(6) || ""}/${
        +parseFloat(row.tp)?.toFixed(6) || ""
      }`,
    minWidth: "180px",
    omit: !hideColumns["SL / TP"],
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
    omit: !hideColumns["Additional parameters"],
  },
  {
    name: "Pledge",
    selector: (row) => row && +parseFloat(row.pledge)?.toFixed(6),
    sortable: true,
    minWidth: "120px",
    omit: !hideColumns.Pledge,
  },
  {
    name: "Current Price",
    selector: (row) => row && +parseFloat(row.currentPrice)?.toFixed(6),
    sortable: true,
    compact: true,
    minWidth: "120px",
    omit: !hideColumns["Current Price"],
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
    omit: !hideColumns.Profit,
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
    omit: !hideColumns.Action,
  },
];

export default dealsColumns;
