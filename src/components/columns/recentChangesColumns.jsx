import { convertTimestamptToDate } from "../../utills/helpers";

const recentChangesColumns = [
  {
    name: "Date",
    selector: (row) => row?.date && convertTimestamptToDate(row.date),
  },
  {
    name: "Manager",
    selector: (row) => row && row.manager,
  },
  { name: "Info", selector: (row) => row.info },
  {
    name: "Update",
    selector: (row) => row.update,
  },
];

export default recentChangesColumns;
