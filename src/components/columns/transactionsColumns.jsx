const transactionsColumns = [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
    sortable: true,
    grow: 0.5,
  },
  {
    name: "Player",
    selector: (row) => row.player,
    sortable: true,
    grow: 2,
    compact: true,
  },
  {
    name: "Type",
    selector: (row) => row.type,
    sortable: true,
  },
  {
    name: "Sum",
    selector: (row) => row.sum,
    sortable: true,
  },
  {
    name: "Method",
    selector: (row) => row.method,
    sortable: true,
  },
  {
    name: "Manager",
    selector: (row) => row.manager,
    sortable: true,
    compact: true,
  },
  {
    name: "Team",
    selector: (row) => row.team,
    sortable: true,
  },
  {
    name: "Desk",
    selector: (row) => row.desk,
    sortable: true,
  },
  {
    name: "Date",
    selector: (row) => row.createdAt,
    sortable: true,
    grow: 2,
    compact: true,
  },
];

export default transactionsColumns;
