import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEdit } from "@fortawesome/free-solid-svg-icons";

const dealsColumns = ({
  isEdit,
  handleEdit,
  handleEditOrder,
  handleCloseOrder,
}) => [
  {
    name: "ID",
    selector: (row) => row.index,
    sortable: true,
  },
  {
    name: "Transaction Type",
    selector: (row) => row.type,
    sortable: true,
    cell: (row) =>
      isEdit ? (
        <input
          type="text"
          value={row.type}
          onChange={(e) => {
            handleEdit(row.id, "type", e.target.value);
          }}
          style={{ width: "100%" }}
        />
      ) : (
        row.type
      ),
  },
  {
    name: "Symbol",
    selector: (row) => row.symbol,
    sortable: true,
    cell: (row) =>
      isEdit ? (
        <input
          type="text"
          value={row.symbol}
          onChange={(e) => {
            handleEdit(row.id, "symbol", e.target.value);
          }}
          style={{ width: "100%" }}
        />
      ) : (
        row.symbol
      ),
  },
  {
    name: "Sum",
    selector: (row) => row.sum,
    sortable: true,
    cell: (row) =>
      isEdit ? (
        <input
          type="text"
          value={row.sum}
          onChange={(e) => {
            handleEdit(row.id, "sum", e.target.value);
          }}
          style={{ width: "100%" }}
        />
      ) : (
        row.sum
      ),
  },
  {
    name: "Price",
    selector: (row) => row.price,
    sortable: true,
    cell: (row) =>
      isEdit ? (
        <input
          type="text"
          value={row.price}
          onChange={(e) => {
            handleEdit(row.id, "price", e.target.value);
          }}
          style={{ width: "100%" }}
        />
      ) : (
        row.price
      ),
  },
  {
    name: "Status",
    selector: (row) => row.status,
    sortable: true,
    cell: (row) =>
      isEdit ? (
        <input
          type="text"
          value={row.status}
          onChange={(e) => {
            handleEdit(row.id, "status", e.target.value);
          }}
          style={{ width: "100%" }}
        />
      ) : (
        row.status
      ),
  },
  {
    name: "Profit",
    selector: (row) => row.profit,
    sortable: true,
    cell: (row) =>
      isEdit ? (
        <input
          type="text"
          value={row.profit}
          onChange={(e) => {
            handleEdit(row.id, "profit", e.target.value);
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
