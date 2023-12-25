import React, { useEffect, useState } from "react";
import {
  getAllSymbols,
  removeDuplicateSymbol,
} from "../utills/firebaseHelpers";
import DataTable from "react-data-table-component";
import symbolsColumns from "./columns/symbolsColumns";
import EditSymbol from "./EditSymbol";
import { Button, Modal, Toast } from "react-bootstrap";
import { toast } from "react-toastify";

const Symbols = () => {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState(false);
  const [deleteDuplicate, setDeleteDuplicate] = useState(false);

  useEffect(() => {
    return getAllSymbols(setSymbols, setLoading);
  }, []);

  console.log("symbols = ", symbols.slice(0, 5));

  const symbolData = symbols
    .filter(({ symbol }) => symbol.endsWith("USDT"))
    .map((s) => {
      return s.duplicates?.length
        ? [
            s,
            ...s.duplicates.map((m) => ({
              symbol: m,
              price: s.price,
              duplicate: s.symbol,
            })),
          ]
        : s;
    })
    .flat();

  return (
    <div>
      <DataTable
        data={symbolData}
        columns={symbolsColumns({
          setSelectedSymbol,
          setDeleteDuplicate,
        })}
        progressPending={loading}
        pagination
      />
      {selectedSymbol && (
        <EditSymbol
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
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
