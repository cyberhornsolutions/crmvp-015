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
    name: "Origin",
    selector: (row) => row && (row.duplicate ? "Duplicate" : "Original"),
  },
  {
    name: "Bid",
    selector: (row) => {
      if (!row) return;
      const { settings = {} } = row;
      const isDirectPrice = settings.bidSpreadUnit === "$";
      const bidValue = getBidValue(
        row.price,
        settings.bidSpread,
        isDirectPrice
      );
      return row?.settings?.group === "currencies"
        ? +parseFloat(bidValue)?.toFixed(6)
        : +parseFloat(bidValue)?.toFixed(2);
    },
    right: true,
  },
  {
    name: "Ask",
    selector: (row) => {
      if (!row) return;
      const { settings = {} } = row;
      const isDirectPrice = settings.askSpreadUnit === "$";

      const askValue = getAskValue(
        row.price,
        settings.askSpread,
        isDirectPrice
      );
      return row?.settings?.group === "currencies"
        ? +parseFloat(askValue)?.toFixed(6)
        : +parseFloat(askValue)?.toFixed(2);
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
