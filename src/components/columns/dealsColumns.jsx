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
  showColumns = {},
} = {}) => [
  // {
  //   name: "ID",
  //   selector: (row, i) => row && i + 1,
  //   sortable: true,
  //   width: "70px",
  //   omit: !showColumns.ID,
  // },
  {
    name: "Date",
    selector: (row) =>
      row.createdTime && convertTimestamptToDate(row.createdTime),
    sortable: true,
    compact: true,
    minWidth: "180px",
    omit: !showColumns.Date,
  },
  {
    name: "Symbol",
    selector: (row) => row.symbol,
    sortable: true,
    minWidth: "fit-content",
    omit: !showColumns.Symbol,
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
    omit: !showColumns.Type,
  },
  {
    name: "Volume",
    selector: (row) => row && +parseFloat(row.volume)?.toFixed(2),
    sortable: true,
    compact: true,
    omit: !showColumns.Volume,
  },
  {
    name: "Open Price",
    selector: (row) => row && +parseFloat(row.symbolValue)?.toFixed(2),
    sortable: true,
    compact: true,
    omit: !showColumns["Open Price"],
  },
  {
    name: "SL / TP",
    selector: (row) =>
      row &&
      `${+parseFloat(row.sl)?.toFixed(2) || ""}/${
        +parseFloat(row.tp)?.toFixed(2) || ""
      }`,
    minWidth: "180px",
    omit: !showColumns["SL / TP"],
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
    omit: !showColumns["Additional parameters"],
  },
  {
    name: "Margin",
    selector: (row) => row && +parseFloat(row.sum)?.toFixed(2),
    sortable: true,
    minWidth: "120px",
    omit: !showColumns.Margin,
  },
  {
    name: "Current Price",
    selector: (row) => row && +parseFloat(row.currentPrice)?.toFixed(2),
    sortable: true,
    compact: true,
    minWidth: "120px",
    omit: !showColumns["Current Price"],
  },
  {
    name: "Profit",
    selector: (row) =>
      row && (
        <div style={{ color: `${row.profit < 0 ? "red" : "green"}` }}>
          {row.profit}
        </div>
      ),
    sortable: true,
    compact: true,
    omit: !showColumns.Profit,
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
    omit: !showColumns.Action,
  },
];

export default dealsColumns;
