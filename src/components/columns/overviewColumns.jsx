import moment from "moment/moment";
const overviewColumns = ({ isEdit, handleEditOrder }) => [
  {
    name: "ID",
    selector: (row, i) => i + 1,
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
      isEdit ? (
        <input
          type="number"
          className="form-control"
          value={row.sum}
          onChange={(e) => {
            handleEditOrder(row.id, "sum", e.target.value);
          }}
        />
      ) : (
        row.sum
      ),
    sortable: true,
  },
  {
    name: "Open Price",
    selector: (row) =>
      isEdit ? (
        <input
          type="number"
          className="form-control"
          value={row.symbolValue}
          onChange={(e) => {
            handleEditOrder(row.id, "symbolValue", e.target.value);
          }}
        />
      ) : (
        row.symbolValue
      ),
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
    selector: (row) => row.profit,
    sortable: true,
    cell: (row) =>
      isEdit ? (
        <input
          type="number"
          className="form-control"
          value={row.profit}
          onChange={(e) => {
            handleEditOrder(row.id, "profit", e.target.value);
          }}
        />
      ) : (
        row.profit
      ),
  },
  {
    name: "Date",
    selector: (row) =>
      isEdit ? (
        <input
          type="date"
          className="form-control"
          value={moment(row.createdAt).format("YYYY-MM-DD")}
          onChange={(e) => {
            handleEditOrder(
              row.id,
              "createdAt",
              moment(e.target.value).format("MM/DD/YYYY")
            );
          }}
        />
      ) : (
        row.createdAt
      ),
    sortable: true,
    grow: 2,
    compact: true,
  },
];

export default overviewColumns;
