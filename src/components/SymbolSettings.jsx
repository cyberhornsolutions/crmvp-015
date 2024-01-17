import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { updateSymbol } from "../utills/firebaseHelpers";

const SymbolSettings = ({ selectedSymbol, setSelectedSymbol }) => {
  const [settings, setSettings] = useState({
    title: selectedSymbol?.settings?.title || "",
    description: selectedSymbol?.settings?.description || "",
    swapShort: selectedSymbol?.settings?.swapShort || "",
    swapLong: selectedSymbol?.settings?.swapLong || "",
    contractSize: selectedSymbol?.settings?.contractSize || "",
    group: selectedSymbol?.settings?.group || "crypto",
    bidSpread: selectedSymbol?.settings?.bidSpread || "1",
    askSpread: selectedSymbol?.settings?.askSpread || "1",
    fee: selectedSymbol?.settings?.fee || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setSettings((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const id = selectedSymbol.duplicate
        ? selectedSymbol.symbolId
        : selectedSymbol.id;

      await updateSymbol(id, { settings });
      toast.success("Symbol settings updated successfully");
      setSelectedSymbol(false);
    } catch (error) {
      toast.error("Failed to update symbol spread values!");
      console.log(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        size="lg"
        show
        onHide={() => setSelectedSymbol(false)}
        className=""
        centered
      >
        <Modal.Header closeButton>
          <h5 className="m-0">Symbol settings {selectedSymbol.symbol}</h5>
        </Modal.Header>
        <Modal.Body>
          <Form className="row row-gap-3" onSubmit={handleSubmit}>
            <div className="col">
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="title" className="col-4">
                  Title
                </Form.Label>
                <div className="col">
                  <Form.Control
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Title"
                    required
                    value={settings.title}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="description" className="col-4">
                  Description
                </Form.Label>
                <div className="col">
                  <Form.Control
                    id="description"
                    name="description"
                    type="text"
                    placeholder="Description"
                    required
                    value={settings.description}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="swap-short" className="col-4">
                  Swap Short
                </Form.Label>
                <div className="col position-relative">
                  <Form.Control
                    id="swap-short"
                    name="swapShort"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0-100%"
                    required
                    value={settings.swapShort}
                    onChange={handleChange}
                  />
                  <span
                    className="position-absolute"
                    style={{ top: 8, right: 15 }}
                  >
                    %
                  </span>
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="swap-long" className="col-4">
                  Swap Long
                </Form.Label>
                <div className="col position-relative">
                  <Form.Control
                    id="swap-long"
                    name="swapLong"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0-100%"
                    required
                    value={settings.swapLong}
                    onChange={handleChange}
                  />
                  <span
                    className="position-absolute"
                    style={{ top: 8, right: 15 }}
                  >
                    %
                  </span>
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="contract-size" className="col-4">
                  Contract Size
                </Form.Label>
                <div className="col">
                  <Form.Control
                    id="contract-size"
                    name="contractSize"
                    type="number"
                    min={1}
                    placeholder="Contract Size"
                    required
                    value={settings.contractSize}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="group" className="col-4">
                  Group
                </Form.Label>
                <div className="col">
                  <Form.Select
                    id="group"
                    name="group"
                    placeholder="Group"
                    required
                    value={settings.group}
                    onChange={handleChange}
                  >
                    <option value="currencies">Currencies</option>
                    <option value="crypto">Crypto</option>
                    <option value="stocks">Stocks</option>
                    <option value="commodities">Commodities</option>
                  </Form.Select>
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="bid-spread" className="col-4">
                  Bid Spread
                </Form.Label>
                <div className="col position-relative">
                  <Form.Control
                    id="bid-spread"
                    name="bidSpread"
                    type="number"
                    step={0.1}
                    min={0}
                    max={50}
                    placeholder="0-50%"
                    required
                    value={settings.bidSpread}
                    onChange={handleChange}
                  />
                  <span
                    className="position-absolute"
                    style={{ top: 8, right: 15 }}
                  >
                    %
                  </span>
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="ask-spread" className="col-4">
                  Ask Spread
                </Form.Label>
                <div className="col position-relative">
                  <Form.Control
                    id="ask-spread"
                    name="askSpread"
                    type="number"
                    step={0.1}
                    min={0}
                    max={50}
                    placeholder="0-50%"
                    required
                    value={settings.askSpread}
                    onChange={handleChange}
                  />
                  <span
                    className="position-absolute"
                    style={{ top: 8, right: 15 }}
                  >
                    %
                  </span>
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="fee" className="col-4">
                  Fee
                </Form.Label>
                <div className="col position-relative">
                  <Form.Control
                    id="fee"
                    name="fee"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0-100%"
                    required
                    value={settings.fee}
                    onChange={handleChange}
                  />
                  <span
                    className="position-absolute"
                    style={{ top: 8, right: 15 }}
                  >
                    %
                  </span>
                </div>
              </Form.Group>
            </div>
            <Button type="submit" disabled={loading}>
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SymbolSettings;
