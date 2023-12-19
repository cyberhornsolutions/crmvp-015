const overviewColumns = ({ isEditProfit, handleEditProfit }) => [
  {
    name: "ID",
    selector: (row, i) => i + 1,
    sortable: true,
  },
  {
    name: "Transaction Type",
    selector: (row) => row.type,
    sortable: true,
    cell: (row) => row.type,
  },
  {
    name: "Symbol",
    selector: (row) => row.symbol,
    sortable: true,
    cell: (row) => row.symbol,
  },
  {
    name: "Sum",
    selector: (row) => row.volume,
    sortable: true,
  },
  {
    name: "Price",
    selector: (row) => row.symbolValue,
    sortable: true,
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
      isEditProfit ? (
        <input
          type="number"
          className="form-control"
          value={row.profit}
          onChange={(e) => {
            handleEditProfit(row.id, "profit", e.target.value);
          }}
          style={{ width: "100%" }}
        />
      ) : (
        row.profit
      ),
  },
  {
    name: "Date",
    selector: (row) => row.createdAt,
    sortable: true,
  },
];

export default overviewColumns;
