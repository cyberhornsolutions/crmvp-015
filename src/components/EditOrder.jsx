import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const EditOrder = ({ onClose, selectedOrder }) => {
  const [record, setRecord] = useState({
    sl: selectedOrder.sl,
    tp: selectedOrder.tp,
  });
  const [loading, setLoading] = useState(false);
  const { tp, sl } = record;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      selectedOrder.type === "Buy" &&
      (sl >= selectedOrder.currentPrice ||
        tp <= selectedOrder.currentMarketPrice)
    ) {
      toast.error(
        "In buy case SL should be less than current price and TP should be greater than current price"
      );
    } else if (
      selectedOrder.type === "Sell" &&
      (sl <= selectedOrder.currentPrice ||
        tp >= selectedOrder.currentMarketPrice)
    ) {
      toast.error(
        "In sell case TP should be less than current price and SL should be greater than current price"
      );
    } else {
      try {
        const updatedData = doc(db, "orders", selectedOrder.id);
        await updateDoc(updatedData, record);
        toast.success("Order updated successfully");
        onClose();
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
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
              <label className="col-4 form-label">Stop loss</label>
              <div className="col">
                <input
                  value={sl}
                  onChange={handleChange}
                  name="sl"
                  type="text"
                  placeholder="Enter stop loss"
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-4">Take Profit</label>
              <div className="col">
                <input
                  type="text"
                  placeholder="Enter price"
                  className="form-control"
                  value={tp}
                  name="tp"
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
