import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import moment from "moment";
import { makeServerDate } from "../utills/helpers";

const EditOrder = ({ onClose, selectedOrder }) => {
  const [record, setRecord] = useState({
    sl: selectedOrder.sl,
    tp: selectedOrder.tp,
    volume: selectedOrder.volume,
    symbolValue: selectedOrder.symbolValue,
  });
  const [loading, setLoading] = useState(false);

  const { createdTime } = selectedOrder;

  const [dateOpened, setDateOpened] = useState(
    moment(createdTime.seconds * 1000).format("YYYY-MM-DD")
  );
  const [timeOpened, setTimeOpened] = useState(
    moment(
      createdTime.seconds * 1000 + createdTime.nanoseconds / 1000000
    ).format("HH:mm:ss")
  );
  const { tp, sl, volume, symbolValue } = record;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecord((prev) => ({ ...prev, [name]: value ? +value : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((sl && !tp) || (tp && !sl))
      return toast.error("Please enter both SL and TP");
    else if (sl && tp) {
      if (
        selectedOrder.type === "Buy" &&
        (sl >= selectedOrder.currentPrice ||
          tp <= selectedOrder.currentMarketPrice)
      ) {
        return toast.error(
          "In buy case SL should be less than current price and TP should be greater than current price"
        );
      }
      if (
        selectedOrder.type === "Sell" &&
        (sl <= selectedOrder.currentPrice ||
          tp >= selectedOrder.currentMarketPrice)
      ) {
        return toast.error(
          "In sell case TP should be less than current price and SL should be greater than current price"
        );
      }
    }
    if (!volume || volume <= 0)
      return toast.error("Volume should be greater than 0");
    if (!symbolValue || symbolValue <= 0)
      return toast.error("Price should be greater than 0");

    setLoading(true);
    try {
      const { seconds } = makeServerDate(
        new Date(dateOpened + " " + timeOpened)
      );
      const payload = { ...record };
      if (volume != selectedOrder.volume) payload.sum = volume * symbolValue;
      if (seconds !== createdTime.seconds)
        payload.createdTime = { ...createdTime, seconds };
      const updatedData = doc(db, "orders", selectedOrder.id);
      await updateDoc(updatedData, payload);
      toast.success("Order updated successfully");
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <>
      <Modal size="md" show onHide={onClose} centered>
        <Modal.Header
          title={`Order Editing-${selectedOrder?.symbol}`}
          closeButton
        >
          <h5 className="mb-0">Order Editing-{selectedOrder?.symbol}</h5>
        </Modal.Header>
        <Modal.Body>
          <form className="d-flex gap-3 flex-column" onSubmit={handleSubmit}>
            <div className="form-group row">
              <label className="col-4" htmlFor="sl">
                Stop loss
              </label>
              <div className="col">
                <input
                  name="sl"
                  id="sl"
                  type="number"
                  step="any"
                  placeholder="Stop Loss"
                  className="form-control"
                  value={sl}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-4" htmlFor="tp">
                Take Profit
              </label>
              <div className="col">
                <input
                  name="tp"
                  id="tp"
                  type="number"
                  step="any"
                  placeholder="Top Price"
                  className="form-control"
                  value={tp}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-4" htmlFor="volume">
                Volume
              </label>
              <div className="col">
                <input
                  name="volume"
                  id="volume"
                  type="number"
                  step="any"
                  placeholder="Volume"
                  className="form-control"
                  required
                  value={volume}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-4" htmlFor="">
                Date Opened
              </label>
              <div className="col">
                <input
                  name=""
                  id=""
                  type="date"
                  placeholder="Date Opened"
                  className="form-control"
                  value={dateOpened}
                  onChange={(e) => setDateOpened(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-4" htmlFor="">
                Time Opened
              </label>
              <div className="col">
                <input
                  name=""
                  id=""
                  type="time"
                  placeholder="Time Opened"
                  className="form-control"
                  value={timeOpened}
                  onChange={(e) => setTimeOpened(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-4" htmlFor="symbolValue">
                Price Opened
              </label>
              <div className="col">
                <input
                  name="symbolValue"
                  id="symbolValue"
                  type="number"
                  step="any"
                  placeholder="Price Opened"
                  className="form-control"
                  required
                  value={symbolValue}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              Current market Price:
              <span className="ms-2 text-success">
                {selectedOrder.currentMarketPrice}
              </span>
            </div>
            <Button type="submit" disabled={loading}>
              Save
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditOrder;
