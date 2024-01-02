import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEdit } from "@fortawesome/free-solid-svg-icons";
import { convertTimestamptToDate } from "../../utills/helpers";

const dealsColumns = ({ handleEditOrder, handleCloseOrder }) => [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
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
  },
  {
    name: "Sum",
    selector: (row) => row.sum,
    sortable: true,
    compact: true,
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
  },
  {
    name: "Profit",
    selector: (row) => row.profit,
    sortable: true,
  },
  {
    name: "Date",
    selector: (row) => row && convertTimestamptToDate(row.createdTime),
    sortable: true,
    grow: 2,
    compact: true,
  },
  {
    name: "Action",
    selector: (row) => row.id,
    cell: (row) =>
      row && (
        <div className="order-actions">
          <div
            className="custom-edit-icon"
            onClick={() => handleEditOrder(row)}
          >
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
