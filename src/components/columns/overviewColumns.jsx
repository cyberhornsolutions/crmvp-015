import moment from "moment/moment";
import { convertTimestamptToDate } from "../../utills/helpers";
import { Timestamp } from "firebase/firestore";

const overviewColumns = ({
  isEdit,
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
      (isEdit ? (
        <input
          type="number"
          className="form-control"
          value={row.sum}
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
      (isEdit ? (
        <input
          type="number"
          className="form-control"
          value={row.symbolValue}
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
  { name: "Swap", selector: (row) => row.swap, omit: !showColumns.Swap },
  { name: "Fee", selector: (row) => row.fee, omit: !showColumns.Fee },
  {
    name: "Status",
    selector: (row) => row.status,
    sortable: true,
    cell: (row) => row.status,
    omit: !showColumns.Status,
  },
  {
    name: "Profit",
    selector: (row) =>
      row &&
      (isEdit ? (
        <input
          type="number"
          className="form-control"
          value={row.profit}
          onChange={(e) => {
            handleEditOrder(row.id, "profit", e.target.value);
          }}
        />
      ) : (
        +parseFloat(row.profit)?.toFixed(2)
      )),
    sortable: true,
    omit: !showColumns.Profit,
  },
  {
    name: "Date",
    selector: (row) =>
      row && isEdit ? (
        <input
          type="datetime-local"
          className="form-control"
          value={moment(convertTimestamptToDate(row.createdTime)).format(
            "YYYY-MM-DDTHH:mm"
          )}
          onChange={(e) => {
            handleEditOrder(
              row.id,
              "createdTime",
              Timestamp.fromDate(new Date(e.target.value))
            );
          }}
        />
      ) : (
        row.createdTime && convertTimestamptToDate(row.createdTime)
      ),
    grow: 2,
    compact: true,
    omit: !showColumns.Date,
  },
];

export default overviewColumns;
