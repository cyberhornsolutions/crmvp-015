import moment from "moment";

const transactionsColumns = [
  {
    name: "ID",
    selector: (row, i) => i + 1,
    sortable: true,
  },
  {
    name: "Player",
    selector: (row) => row.player,
    sortable: true,
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
    selector: (row) => moment(row.date).format("MM/DD/YYYY hh:mm A"),
    sortable: true,
    grow: 2,
  },
];

export default transactionsColumns;
