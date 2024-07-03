import { convertTimestamptToDate } from "../../utills/helpers";

const remindersColumns = (managers, players) => [
  {
    name: "Date",
    selector: (row) => row?.date && convertTimestamptToDate(row.date),
  },
  {
    name: "Name",
    selector: (row) => players?.find((p) => p.id === row.userId)?.name,
  },
  {
    name: "Surname",
    selector: (row) => players?.find((p) => p.id === row.userId)?.surname,
  },
  {
    name: "Manager",
    selector: (row) => managers?.find((m) => m.id === row.manager)?.username,
  },
  {
    name: "Comment",
    selector: (row) => row && String(row.comment).substring(0, 20),
  },
];

export default remindersColumns;
