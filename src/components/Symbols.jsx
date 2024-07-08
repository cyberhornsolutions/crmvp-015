import React, { useCallback, useEffect, useState } from "react";
import {
  getAllSymbols,
  removeDuplicateSymbol,
} from "../utills/firebaseHelpers";
import DataTable from "react-data-table-component";
import symbolsColumns from "./columns/symbolsColumns";
import DuplicateSymbolModal from "./DuplicateSymbolModal";
import SymbolSettings from "./SymbolSettings";
import { Button, Modal, Navbar, Nav } from "react-bootstrap";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setSymbolsState } from "../redux/slicer/symbolsSlicer";
import { fillArrayWithEmptyRows, filterSearchObjects } from "../utills/helpers";
import AddNewGroupModal from "./AddNewGroupModal";

const Symbols = () => {
  const dispatch = useDispatch();
  const symbols = useSelector((state) => state.symbols);
  const [tab, setTab] = useState("cryptoTab");
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(false);
  const [deleteDuplicate, setDeleteDuplicate] = useState(false);
  const [symbolSettings, setSymbolSettings] = useState(false);
  const [showAddNewGroupModal, setShowAddNewGroupModal] = useState(false);

  const setSymbols = useCallback((symbolsData) => {
    dispatch(setSymbolsState(symbolsData));
  }, []);

  useEffect(() => {
    if (!symbols.length) {
      getAllSymbols(setSymbols);
    }
  }, []);

  const filteredSymbols = searchText
    ? filterSearchObjects(searchText, symbols)
    : symbols;

  const crypto = [],
    currencies = [],
    stocks = [],
    commodities = [];
  filteredSymbols.forEach((s) => {
    if (s?.settings?.group === "crypto" || !s.settings) crypto.push(s);
    else if (s?.settings?.group === "currencies") currencies.push(s);
    else if (s?.settings?.group === "stocks") stocks.push(s);
    else if (s?.settings?.group === "commodities") commodities.push(s);
  });

  const customStyles = {
    pagination: {
      style: {
        fontSize: "1rem",
        minHeight: 30,
        height: 30,
      },
    },
    headCells: {
      style: {
        fontSize: "1rem",
      },
    },
    rows: {
      style: {
        fontSize: "1rem",
        height: 36,
        minHeight: 36,
      },
    },
  };

  const closeAddNewGroupModal = () => {
    setShowAddNewGroupModal(false);
    setTab("cryptoTab");
  };

  return (
    <div>
      <Navbar className="nav nav-tabs p-0 mx-2">
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
          <Nav.Link
            className={tab === "newGroupTab" && "active"}
            onClick={() => {
              setShowAddNewGroupModal(true);
              setTab("newGroupTab");
            }}
          >
            +
          </Nav.Link>
        </Nav>
      </Navbar>
      <div className="m-2 mb-0">
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
            data={fillArrayWithEmptyRows(crypto, 15)}
            columns={symbolsColumns({
              setSelectedSymbol,
              setDeleteDuplicate,
              setSymbolSettings,
            })}
            pagination
            paginationPerPage={15}
            paginationComponentOptions={{
              noRowsPerPage: 1,
            }}
            paginationTotalRows={crypto.length}
            highlightOnHover
            // dense
            // pointerOnHover
            customStyles={customStyles}
          />
        )}
        {tab === "currenciesTab" && (
          <DataTable
            data={fillArrayWithEmptyRows(currencies, 15)}
            columns={symbolsColumns({
              setSelectedSymbol,
              setDeleteDuplicate,
              setSymbolSettings,
            })}
            pagination
            paginationPerPage={15}
            paginationComponentOptions={{
              noRowsPerPage: 1,
            }}
            paginationTotalRows={currencies.length}
            highlightOnHover
            // pointerOnHover
            customStyles={customStyles}
          />
        )}
        {tab === "stocksTab" && (
          <DataTable
            data={fillArrayWithEmptyRows(stocks, 15)}
            columns={symbolsColumns({
              setSelectedSymbol,
              setDeleteDuplicate,
              setSymbolSettings,
            })}
            pagination
            paginationPerPage={15}
            paginationComponentOptions={{
              noRowsPerPage: 1,
            }}
            paginationTotalRows={stocks.length}
            highlightOnHover
            // pointerOnHover
            customStyles={customStyles}
          />
        )}
        {tab === "commoditiesTab" && (
          <DataTable
            data={fillArrayWithEmptyRows(commodities, 15)}
            columns={symbolsColumns({
              setSelectedSymbol,
              setDeleteDuplicate,
              setSymbolSettings,
            })}
            pagination
            paginationPerPage={15}
            paginationComponentOptions={{
              noRowsPerPage: 1,
            }}
            paginationTotalRows={commodities.length}
            highlightOnHover
            customStyles={customStyles}
          />
        )}
      </div>

      {selectedSymbol && (
        <DuplicateSymbolModal
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

      {showAddNewGroupModal && (
        <AddNewGroupModal closeModal={closeAddNewGroupModal} />
      )}
    </div>
  );
};

export default Symbols;

const DeleteSymbol = ({ selectedSymbol, setSelectedSymbol }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await removeDuplicateSymbol(selectedSymbol);
      toast.success("Duplicate symbol deleted successfully!");
      setSelectedSymbol(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Modal size="md" show onHide={() => setSelectedSymbol(false)} centered>
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
            <Button type="submit" disabled={loading} onClick={handleSubmit}>
              Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};
