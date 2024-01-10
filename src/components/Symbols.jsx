import React, { useCallback, useEffect, useState } from "react";
import {
  getAllSymbols,
  removeDuplicateSymbol,
} from "../utills/firebaseHelpers";
import DataTable from "react-data-table-component";
import symbolsColumns from "./columns/symbolsColumns";
import EditSymbol from "./EditSymbol";
import SymbolSettings from "./SymbolSettings";
import { Button, Modal, Navbar, Nav } from "react-bootstrap";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setSymbolsState } from "../redux/slicer/symbolsSlicer";
import { fillArrayWithEmptyRows, filterSearchObjects } from "../utills/helpers";

const Symbols = () => {
  const dispatch = useDispatch();
  const symbols = useSelector((state) => state.symbols);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("cryptoTab");
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(false);
  const [deleteDuplicate, setDeleteDuplicate] = useState(false);
  const [symbolSettings, setSymbolSettings] = useState(false);

  const setSymbols = useCallback((symbolsData) => {
    dispatch(setSymbolsState(symbolsData));
  }, []);

  useEffect(() => {
    if (!symbols.length) {
      getAllSymbols(setSymbols, setLoading);
    }
  }, []);

  const filteredSymbols = searchText
    ? filterSearchObjects(searchText, symbols)
    : symbols;

  const crypto = filteredSymbols
    .filter(({ symbol }) => symbol.endsWith("USDT"))
    .map((s) => {
      return s.duplicates?.length
        ? [
            s,
            ...s.duplicates.map((m) => ({
              symbolId: s.id,
              symbol: m,
              price: s.price,
              duplicate: s.symbol,
              bidSpread: s.bidSpread,
              askSpread: s.askSpread,
            })),
          ]
        : s;
    })
    .flat();

  const currencies = [];
  const stocks = [];
  const commodities = [];

  return (
    <div>
      <Navbar className="nav nav-tabs p-0">
        <Nav>
          <Nav.Link
            className={tab === "cryptoTab" && "active"}
            onClick={() => setTab("cryptoTab")}
          >
            Crypto
          </Nav.Link>
          <Nav.Link
            className={tab === "currenciesTab" && "active"}
            onClick={() => setTab("currenciesTab")}
          >
            Currencies
          </Nav.Link>
          <Nav.Link
            className={tab === "stocksTab" && "active"}
            onClick={() => setTab("stocksTab")}
          >
            Stocks
          </Nav.Link>
          <Nav.Link
            className={tab === "commoditiesTab" && "active"}
            onClick={() => setTab("commoditiesTab")}
          >
            Commodities
          </Nav.Link>
        </Nav>
      </Navbar>
      <div className="tab-content">
        <div className="input-group input-group-sm gap-1">
          <select
            className="input-group-text"
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
          >
            <option className="d-none" disabled value="">
              Search By
            </option>
            <option className="dropdown-item" value="All">
              All
            </option>
            {symbolsColumns()
              .slice(0, -1)
              .map(({ name }, i) => (
                <option key={i} className="dropdown-item">
                  {name}
                </option>
              ))}
          </select>
          <input
            className="form-control-sm w-25"
            type="search"
            autoComplete="off"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search.."
          />
        </div>
        {tab === "cryptoTab" && (
          <DataTable
            data={fillArrayWithEmptyRows(crypto, 5)}
            columns={symbolsColumns({
              setSelectedSymbol,
              setDeleteDuplicate,
              setSymbolSettings,
            })}
            pagination
          />
        )}
        {tab === "currenciesTab" && (
          <>
            <DataTable
              data={fillArrayWithEmptyRows(currencies, 5)}
              columns={symbolsColumns()}
              pagination
            />
          </>
        )}
        {tab === "stocksTab" && (
          <>
            <DataTable
              data={fillArrayWithEmptyRows(stocks, 5)}
              columns={symbolsColumns()}
              pagination
            />
          </>
        )}
        {tab === "commoditiesTab" && (
          <>
            <DataTable
              data={fillArrayWithEmptyRows(commodities, 5)}
              columns={symbolsColumns()}
              pagination
            />
          </>
        )}
      </div>

      {selectedSymbol && (
        <EditSymbol
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
        />
      )}
      {symbolSettings && (
        <SymbolSettings
          selectedSymbol={symbolSettings}
          setSelectedSymbol={setSymbolSettings}
        />
      )}

      {deleteDuplicate && (
        <DeleteSymbol
          selectedSymbol={deleteDuplicate}
          setSelectedSymbol={setDeleteDuplicate}
        />
      )}
    </div>
  );
};

export default Symbols;

const DeleteSymbol = ({ selectedSymbol, setSelectedSymbol }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await removeDuplicateSymbol(selectedSymbol);
      toast.success("Duplicate symbol deleted successfully!");
      setSelectedSymbol(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Modal
        size="md"
        show
        onHide={() => setSelectedSymbol(false)}
        className=""
        centered
      >
        <Modal.Header closeButton>
          <div className="d-flex justify-content-between align-items-center">
            <h5>Delete Duplicate Symbol {selectedSymbol.symbol}</h5>
          </div>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure to delete this duplicate symbol?</p>
          <div className="d-flex align-items-center gap-2 justify-content-center">
            <Button
              type="submit"
              className=""
              onClick={() => setSelectedSymbol(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="" onClick={handleSubmit}>
              Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};
