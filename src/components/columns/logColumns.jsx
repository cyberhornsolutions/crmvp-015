import { convertTimestamptToDate } from "../../utills/helpers";

const logColumns = [
  {
    name: "Date",
    selector: (row) => row && convertTimestamptToDate(row.date),
  },
  {
    name: "Action",
    selector: (row) => row && row.action,
  },
];

export default logColumns;
