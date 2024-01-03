import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faClose } from "@fortawesome/free-solid-svg-icons";

const symbolsColumns = (
  { setSelectedSymbol, setDeleteDuplicate } = {
    setSelectedSymbol: () => {},
    setDeleteDuplicate: () => {},
  }
) => [
  { name: "Symbol", selector: (row) => row.symbol },
  {
    name: "Bid",
    selector: (row) => row && +row.price,
    right: true,
  },
  {
    name: "Ask",
    selector: (row) => {
      if (!row) return;
      const bidValue = row.price;
      return +bidValue + bidValue / 100;
    },
    right: true,
  },
  {
    name: "Action",
    selector: (row) =>
      row && (
        <div className="order-actions">
          {!row.duplicate && (
            <div
              className="custom-edit-icon"
              onClick={() => setSelectedSymbol(row)}
            >
              <FontAwesomeIcon icon={faEdit} />
            </div>
          )}
          {row.duplicate && (
            <div
              className="custom-delete-icon"
              onClick={() => setDeleteDuplicate(row)}
            >
              <FontAwesomeIcon icon={faClose} />
            </div>
          )}
        </div>
      ),
    center: true,
    grow: 2,
    compact: true,
  },
];

export default symbolsColumns;
