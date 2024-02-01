import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { addDuplicateSymbol } from "../utills/firebaseHelpers";

const DuplicateSymbolModal = ({ selectedSymbol, setSelectedSymbol }) => {
  const [newSymbol, setNewSymbol] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDuplicateSymbol(selectedSymbol, newSymbol);
      toast.success("Duplicate symbol added successfully!");
      setSelectedSymbol(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
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
            <h5>Duplicate Symbol {selectedSymbol.symbol}</h5>
          </div>
        </Modal.Header>
        <Modal.Body className=" d-flex flex-column gap-3 p-3 pt-0 mt-3">
          <form className="d-flex gap-2 flex-column" onSubmit={handleSubmit}>
            <div className="form-group row">
              <label className="col-md-3 col-form-label d-flex justify-content-between align-items-center">
                New Symbol
              </label>
              <div className="col-md-7">
                <input
                  type="text"
                  placeholder="Enter Symbol"
                  className="form-control"
                  value={newSymbol}
                  name="symbol"
                  onChange={(e) => setNewSymbol(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="px-5 w-100" disabled={loading}>
              Duplicate
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DuplicateSymbolModal;
