import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCopy } from "@fortawesome/free-solid-svg-icons";
import { getAskValue, getBidValue } from "../../utills/helpers";
import { BsGear } from "react-icons/bs";

const symbolsColumns = (
  { setSelectedSymbol, setDeleteDuplicate, setSymbolSettings } = {
    setSelectedSymbol: () => {},
    setDeleteDuplicate: () => {},
    setSymbolSettings: () => {},
  }
) => [
  { name: "Symbol", selector: (row) => row.symbol },
  {
    name: "Bid",
    selector: (row) => row && getBidValue(row.price),
    right: true,
  },
  {
    name: "Ask",
    selector: (row) => {
      if (!row) return;
      return getAskValue(row.price);
    },
    right: true,
  },
  {
    name: "Action",
    selector: (row) =>
      row && (
        <div className="d-flex align-items-center gap-2">
          {!row.duplicate && (
            <FontAwesomeIcon
              icon={faCopy}
              onClick={() => setSelectedSymbol(row)}
            />
          )}
          {row.duplicate && (
            <FontAwesomeIcon
              icon={faClose}
              onClick={() => setDeleteDuplicate(row)}
            />
          )}
          <BsGear size={18} onClick={() => setSymbolSettings(row)} />
        </div>
      ),
    center: true,
    grow: 2,
    compact: true,
  },
];

export default symbolsColumns;
