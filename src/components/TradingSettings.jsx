import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { updateSymbolSpread } from "../utills/firebaseHelpers";
import { useSelector } from "react-redux";

const TradingSettings = ({ setShowModal }) => {
  // const [bidSpread, setBidSpread] = useState(selectedSymbol?.bidSpread || 1);
  // const [askSpread, setAskSpread] = useState(selectedSymbol?.askSpread || 1);

  const { selectedUser, user } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // try {
    //   const spread = {
    //     bidSpread,
    //     askSpread,
    //   };
    //   const id = selectedSymbol.duplicate
    //     ? selectedSymbol.symbolId
    //     : selectedSymbol.id;

    //   await updateSymbolSpread(id, spread);
    //   toast.success("Symbol spread values updated successfully");
    //   setSelectedSymbol(false);
    // } catch (error) {
    //   toast.error("Failed to update symbol spread values!");
    //   console.log(error.message);
    // }
  };

  return (
    <>
      <Modal size="md" show onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <h5 className="m-0">Trading settings</h5>
        </Modal.Header>
        <Modal.Body className="p-3">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="row mb-3">
              <div className="col-3">
                <Form.Label htmlFor="group" className="">
                  Group
                </Form.Label>
              </div>
              <div className="col">
                <Form.Select
                  id="group"
                  placeholder="Group"
                  required
                  // onChange={(e) => setBidSpread(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="special">Special</option>
                </Form.Select>
              </div>
            </Form.Group>
            <Form.Group className="row mb-3">
              <div className="col-3">
                <Form.Label htmlFor="leverage">Leverage</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="leverage"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Leverage"
                  required
                  // onChange={(e) => setBidSpread(e.target.value)}
                />
              </div>
            </Form.Group>
            <Form.Group className="row mb-3">
              <div className="col-3">
                <Form.Label htmlFor="stop-out">Stop-out</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="stop-out"
                  type="number"
                  min={1}
                  placeholder="Stop-out"
                  required
                  // onChange={(e) => setBidSpread(e.target.value)}
                />
              </div>
            </Form.Group>
            <Form.Group className="row mb-3">
              <div className="col-3">
                <Form.Label htmlFor="min-deposit">Min deposit</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="min-deposit"
                  type="number"
                  min={1}
                  placeholder="Min deposit"
                  required
                  // onChange={(e) => setBidSpread(e.target.value)}
                />
              </div>
            </Form.Group>
            <Form.Group className="row mb-3">
              <div className="col-3">
                <Form.Label htmlFor="max-deals">Max deals</Form.Label>
              </div>
              <div className="col">
                <Form.Control
                  id="max-deals"
                  type="number"
                  min={1}
                  placeholder="Max deals"
                  required
                  // onChange={(e) => setBidSpread(e.target.value)}
                />
              </div>
            </Form.Group>
            <Form.Check
              id="allow-bonus"
              className="mb-3"
              label="Allow using bonus"
              inline
              reverse
            />
            <Button type="submit" className="w-100">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TradingSettings;
