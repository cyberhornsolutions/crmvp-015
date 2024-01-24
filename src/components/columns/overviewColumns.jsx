import moment from "moment/moment";
import { convertTimestamptToDate } from "../../utills/helpers";
import { Timestamp } from "firebase/firestore";

const overviewColumns = ({ isEdit, handleEditOrder }) => [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
    sortable: true,
    grow: 0.5,
  },
  {
    name: "Transaction Type",
    selector: (row) => row.type,
    sortable: true,
    compact: true,
  },
  {
    name: "Symbol",
    selector: (row) => row.symbol,
    sortable: true,
    cell: (row) => row.symbol,
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
        +parseFloat(row.sum)?.toFixed(6)
      )),
    sortable: true,
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
        +parseFloat(row.symbolValue)?.toFixed(6)
      )),
    sortable: true,
    grow: 1.5,
    compact: true,
  },
  {
    name: "Status",
    selector: (row) => row.status,
    sortable: true,
    cell: (row) => row.status,
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
        +row.profit?.toFixed(6)
      )),
    sortable: true,
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
    sortable: true,
    grow: 2,
    compact: true,
  },
];

export default overviewColumns;
