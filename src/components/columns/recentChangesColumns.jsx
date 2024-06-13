const recentChangesColumns = [
  {
    name: "Date",
    selector: (row) => row && row.createdAt,
    // grow: 1.5,
  },
  {
    name: "Manager",
    selector: (row) => row && row.manager,
    // grow: 0.5,
  },
  { name: "Info", selector: (row) => row.info },
  {
    name: "Update",
    selector: (row) => row.update,
  },
];

export default recentChangesColumns;
