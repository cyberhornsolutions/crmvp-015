import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { updateSymbolSpread } from "../utills/firebaseHelpers";

const SymbolSettings = ({ selectedSymbol, setSelectedSymbol }) => {
  const [bidSpread, setBidSpread] = useState(selectedSymbol.bidSpread || 1);
  const [askSpread, setAskSpread] = useState(selectedSymbol.askSpread || 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const spread = {
        bidSpread,
        askSpread,
      };
      await updateSymbolSpread(selectedSymbol.id, spread);
      toast.success("Symbol spread values updated successfully");
      setSelectedSymbol(false);
    } catch (error) {
      toast.error("Failed to update symbol spread values!");
      console.log(error.message);
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
            <h5>Symbol settings {selectedSymbol.symbol}</h5>
          </div>
        </Modal.Header>
        <Modal.Body className=" d-flex flex-column gap-3 p-3 pt-0 mt-3">
          <form className="d-flex gap-3 flex-column" onSubmit={handleSubmit}>
            <div className="row align-items-center">
              <div className="col-3">
                <label htmlFor="bid-spread">Bid Spread</label>
              </div>
              <div className="col">
                <div className="d-flex align-items-center">
                  <input
                    type="number"
                    step={0.1}
                    min={1}
                    max={100}
                    id="bid-spread"
                    placeholder="Bid Spread"
                    className="form-control"
                    required
                    value={bidSpread}
                    onChange={(e) => setBidSpread(e.target.value)}
                  />
                  %
                </div>
              </div>
            </div>
            <div className="row align-items-center">
              <div className="col-3">
                <label htmlFor="ask-spread">Ask Spread</label>
              </div>
              <div className="col">
                <div className="d-flex align-items-center">
                  <input
                    type="number"
                    step={0.1}
                    min={1}
                    max={100}
                    id="ask-spread"
                    placeholder="Ask Spread"
                    className="form-control"
                    required
                    value={askSpread}
                    onChange={(e) => setAskSpread(e.target.value)}
                  />
                  %
                </div>
              </div>
            </div>
            <Button type="submit">Save</Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SymbolSettings;
