import React, { useState } from "react";
import { Button, Modal, Form, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  setCommoditiesPriceToUpdate,
  updateSymbol,
  updateSymbolAndPriceHistory,
} from "../utills/firebaseHelpers";
import moment from "moment";

const SymbolSettings = ({ selectedSymbol, setSelectedSymbol }) => {
  const symbolSettings = selectedSymbol.settings || {};
  const [title, setTitle] = useState(selectedSymbol?.symbol);
  const [price, setPrice] = useState(selectedSymbol?.price);
  const [settings, setSettings] = useState({
    description: symbolSettings?.description || "",
    swapShort: symbolSettings?.swapShort || "",
    swapShortUnit: symbolSettings?.swapShortUnit || "%",
    swapLong: symbolSettings?.swapLong || "",
    swapLongUnit: symbolSettings?.swapLongUnit || "%",
    contractSize: symbolSettings?.contractSize || "",
    gapLevel: symbolSettings?.gapLevel || "0",
    stopLevel: symbolSettings?.stopLevel || "0",
    group: symbolSettings?.group || "crypto",
    bidSpread: symbolSettings?.bidSpread || "1",
    bidSpreadUnit: symbolSettings?.bidSpreadUnit || "%",
    askSpread: symbolSettings?.askSpread || "1",
    askSpreadUnit: symbolSettings?.askSpreadUnit || "%",
    fee: symbolSettings?.fee || "",
    feeUnit: symbolSettings?.feeUnit || "%",
    maintenanceMargin: symbolSettings?.maintenanceMargin || "100",
    lot: symbolSettings?.lot || "1",
  });
  const [closedMarket, setClosedMarket] = useState(
    symbolSettings?.closedMarket ?? false
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setSettings((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...setSelectedSymbol,
      settings,
    };
    let isMarketClose = false;
    if (settings.group === "commodities") {
      const today = moment().utc();
      const hour = today.hour();
      const weekDay = today.weekday();
      if (weekDay == 0 || weekDay == 6 || hour < 9 || hour >= 23) {
        isMarketClose = true;
      }
      payload.settings.closedMarket = closedMarket;
    }
    let updatePriceHistory = false;
    // if (selectedSymbol.duplicate) {
    if (!price) return toast.error("Please enter current price for the symbol");
    else if (price <= 0)
      return toast.error("Symbol Price must be greater than 0");
    payload.symbol = title;
    if (price !== selectedSymbol.price) {
      payload.price = price;
      updatePriceHistory = true;
    }
    // }
    setLoading(true);
    try {
      if (updatePriceHistory && isMarketClose)
        await setCommoditiesPriceToUpdate(selectedSymbol.id, {
          newPrice: price,
          shouldApply: true,
        });
      else if (updatePriceHistory)
        await updateSymbolAndPriceHistory(selectedSymbol.id, payload);
      else await updateSymbol(selectedSymbol.id, payload);
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
          <h5 className="m-0">Asset settings {selectedSymbol.symbol}</h5>
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
                    disabled={!selectedSymbol.duplicate}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                <InputGroup className="col">
                  <Form.Control
                    id="swap-short"
                    name="swapShort"
                    type="number"
                    step="any"
                    className="w-50"
                    min={0}
                    max={100}
                    placeholder="0-100%"
                    required
                    value={settings.swapShort}
                    onChange={handleChange}
                  />
                  <Form.Select
                    size="sm"
                    name="swapShortUnit"
                    required
                    value={settings.swapShortUnit}
                    onChange={handleChange}
                  >
                    <option>%</option>
                    <option>$</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="swap-long" className="col-4">
                  Swap Long
                </Form.Label>
                <InputGroup className="col">
                  <Form.Control
                    id="swap-long"
                    name="swapLong"
                    type="number"
                    step="any"
                    className="w-50"
                    min={0}
                    max={100}
                    placeholder="0-100%"
                    required
                    value={settings.swapLong}
                    onChange={handleChange}
                  />
                  <Form.Select
                    size="sm"
                    name="swapLongUnit"
                    required
                    value={settings.swapLongUnit}
                    onChange={handleChange}
                  >
                    <option>%</option>
                    <option>$</option>
                  </Form.Select>
                </InputGroup>
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
                    step="any"
                    min={1}
                    placeholder="Contract Size"
                    required
                    value={settings.contractSize}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="gap-level" className="col-4">
                  Gap Level
                </Form.Label>
                <div className="col">
                  <Form.Control
                    id="gap-level"
                    className="stopClik"
                    name="gapLevel"
                    type="number"
                    step="any"
                    min={0}
                    placeholder="Gap Level"
                    required
                    readOnly
                    value={settings.gapLevel}
                    // onChange={handleChange}
                  />
                </div>
              </Form.Group>
              {symbolSettings?.group === "commodities" && (
                <Form.Group className="row align-items-center mb-2">
                  <Form.Label htmlFor="market-open" className="col-4">
                    Market open
                  </Form.Label>
                  <div className="col">
                    <Form.Control
                      id="market-open"
                      type="text"
                      disabled
                      value="Mon-Fri: 9AM-23PM"
                    />
                  </div>
                </Form.Group>
              )}
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="maintenance-margin" className="col-4">
                  Maintenance margin
                </Form.Label>
                <div className="col">
                  <Form.Control
                    id="maintenance-margin"
                    name="maintenanceMargin"
                    type="number"
                    min={1}
                    max={100}
                    placeholder="Maintenance margin"
                    required
                    value={settings.maintenanceMargin}
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
                    disabled={!selectedSymbol.duplicate}
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
                <InputGroup className="col">
                  <Form.Control
                    id="bid-spread"
                    name="bidSpread"
                    type="number"
                    step="any"
                    className="w-50"
                    min={0}
                    max={10000}
                    placeholder="0-10000"
                    required
                    value={settings.bidSpread}
                    onChange={handleChange}
                  />
                  <Form.Select
                    size="sm"
                    name="bidSpreadUnit"
                    required
                    value={settings.bidSpreadUnit}
                    onChange={handleChange}
                  >
                    <option>%</option>
                    <option>$</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="ask-spread" className="col-4">
                  Ask Spread
                </Form.Label>
                <InputGroup className="col">
                  <Form.Control
                    id="ask-spread"
                    name="askSpread"
                    type="number"
                    step="any"
                    className="w-50"
                    min={0}
                    max={10000}
                    placeholder="0-10000"
                    required
                    value={settings.askSpread}
                    onChange={handleChange}
                  />
                  <Form.Select
                    size="sm"
                    name="askSpreadUnit"
                    required
                    value={settings.askSpreadUnit}
                    onChange={handleChange}
                  >
                    <option>%</option>
                    <option>$</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="fee" className="col-4">
                  Fee
                </Form.Label>
                <InputGroup className="col">
                  <Form.Control
                    id="fee"
                    name="fee"
                    type="number"
                    step="any"
                    className="w-50"
                    min={0}
                    max={100}
                    placeholder="0-100%"
                    required
                    value={settings.fee}
                    onChange={handleChange}
                  />
                  <Form.Select
                    size="sm"
                    name="feeUnit"
                    required
                    value={settings.feeUnit}
                    onChange={handleChange}
                  >
                    <option>%</option>
                    <option>$</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="price" className="col-4">
                  Current Price
                </Form.Label>
                <div className="col">
                  <Form.Control
                    name="price"
                    id="price"
                    type="number"
                    step="any"
                    min={0}
                    placeholder="Current Price"
                    value={price ? +price : price}
                    required
                    // readOnly={!selectedSymbol.duplicate}
                    onChange={
                      (e) => setPrice(e.target.value)
                      // selectedSymbol.duplicate && setPrice(e.target.value)
                    }
                  />
                </div>
              </Form.Group>
              <Form.Group className="row align-items-center mb-2">
                <Form.Label htmlFor="stop-level" className="col-4">
                  Stop Level
                </Form.Label>
                <div className="col">
                  <Form.Control
                    name="stopLevel"
                    id="stop-level"
                    className="stopClik"
                    type="number"
                    step="any"
                    min={0}
                    placeholder="Stop Level"
                    required
                    readOnly
                    value={settings.stopLevel}
                    // onChange={handleChange}
                  />
                </div>
              </Form.Group>
              {symbolSettings?.group === "commodities" && (
                <>
                  <Form.Group className="row align-items-center mb-2">
                    <Form.Label htmlFor="lot" className="col-4 m-0">
                      Lot
                    </Form.Label>
                    <div className="col">
                      <Form.Control
                        id="lot"
                        name="lot"
                        type="number"
                        step="any"
                        min={1}
                        max={1000000}
                        placeholder="1-1000000"
                        value={settings.lot}
                        required
                        onChange={handleChange}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group className="d-flex align-items-center gap-3 pt-2">
                    <Form.Label htmlFor="closed-trading" className="mb-0">
                      Closed market trading
                    </Form.Label>
                    <Form.Check
                      id="closed-trading"
                      checked={closedMarket}
                      onChange={(e) => setClosedMarket(e.target.checked)}
                    />
                  </Form.Group>
                </>
              )}
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
