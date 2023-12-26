import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEdit } from "@fortawesome/free-solid-svg-icons";

const dealsColumns = ({ handleEditOrder, handleCloseOrder }) => [
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
    selector: (row) => row.sum,
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
    cell: (row) => row.profit,
  },
  {
    name: "Date",
    selector: (row) => row.createdAt,
    sortable: true,
  },
  {
    name: "Action",
    selector: (row) => row.id,
    cell: (row) => (
      <div className="order-actions">
        <div className="custom-edit-icon" onClick={() => handleEditOrder(row)}>
          <FontAwesomeIcon icon={faEdit} />
        </div>
        <div className="ml-5">
          <FontAwesomeIcon
            icon={faClose}
            onClick={() => handleCloseOrder(row)}
          />
        </div>
      </div>
    ),
    sortable: false,
  },
];

export default dealsColumns;
