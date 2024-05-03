import { convertTimestamptToDate } from "../../utills/helpers";

const teamsColumns = [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
  },
  {
    name: "Name", // Translate the header using your t function
    selector: (row) => row.name,

    sortable: true,
  },
  {
    name: "Desk",
    selector: (row) => row.desk,
    sortable: true,
  },
  {
    name: "Date",
    selector: (row) => row.date && convertTimestamptToDate(row.date),
    sortable: true,
  },
];

export default teamsColumns;
