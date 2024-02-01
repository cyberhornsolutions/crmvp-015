import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { addDuplicateSymbol } from "../utills/firebaseHelpers";

const DuplicateSymbolModal = ({ selectedSymbol, setSelectedSymbol }) => {
  const [newSymbol, setNewSymbol] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSymbol) return toast.error("Enter Symbol Title");
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
      <Modal show onHide={() => setSelectedSymbol(false)} centered>
        <Modal.Header closeButton>
          <h5 className="mb-0">Duplicate Symbol {selectedSymbol.symbol}</h5>
        </Modal.Header>
        <Modal.Body>
          <Form className="d-flex gap-3 flex-column" onSubmit={handleSubmit}>
            <Form.Group className="row align-items-center">
              <Form.Label className="col-4">New Symbol</Form.Label>
              <div className="col">
                <Form.Control
                  type="text"
                  placeholder="Title"
                  value={newSymbol}
                  name="symbol"
                  required
                  onChange={(e) => setNewSymbol(e.target.value)}
                />
              </div>
            </Form.Group>
            <Button type="submit" disabled={loading || !newSymbol}>
              Duplicate
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DuplicateSymbolModal;
