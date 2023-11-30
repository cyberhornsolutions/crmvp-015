import moment from "moment";
import React, { useState } from "react";
import { Button, Modal, Toast } from "react-bootstrap";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const EditOrder = ({ onClose, show, selectedOrder, fetchOrders }) => {
  const [record, setRecord] = useState({
    type: selectedOrder?.type,
    symbol: selectedOrder?.symbol,
    volume: selectedOrder?.sum,
    price: selectedOrder?.price,
    profit: selectedOrder?.profit,
    createdAt: selectedOrder?.createdAt,
    createdTime: selectedOrder.createdTime,
    sl: selectedOrder.sl,
    tp: selectedOrder.tp,
    userId: selectedOrder.userId,
    status: selectedOrder.status,
  });
  const {
    volume,
    price,
    symbol,
    type,
    createdAt,
    profit,
    createdTime,
    tp,
    sl,
  } = record;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!volume) {
      toast.error("Volume required");
    }
    if (!createdAt) {
      toast.error("Date opened required");
    }
    if (!price) {
      toast.error("price required");
    }
    if (!createdTime) {
      toast.error("Time opened required");
    }
    const updatedData = doc(db, "orders", selectedOrder.docId);
    try {
      await updateDoc(updatedData, record);
      fetchOrders({ id: selectedOrder.userId });
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <Modal size="md" show={show} onHide={onClose} className="" centered>
        <Modal.Header
          //   className="bg-transparent border-0 rounded-0 text-center p-1 pb-0 align-items-center"
          title={`Order Editing-${selectedOrder?.symbol}`}
          closeButton
        >
          <div className="d-flex justify-content-between align-items-center">
            <h5>Order Editing-{selectedOrder?.symbol}</h5>
          </div>
        </Modal.Header>
        <Modal.Body className=" d-flex flex-column gap-3 p-3 pt-0 mt-3">
          <form className="d-flex gap-2 flex-column" onSubmit={handleSubmit}>
            <div className="form-group row">
              <label className="col-md-3 col-form-label d-flex justify-content-end align-items-center ">
                Volume
              </label>
              <div className="col-md-7 ">
                <input
                  onChange={handleChange}
                  name="volume"
                  placeholder="Enter volume"
                  type="number"
                  className="form-control"
                  value={volume}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-md-3 col-form-label d-flex justify-content-end align-items-center">
                Date opened
              </label>
              <div className="col-md-7">
                <input
                  name="createdAt"
                  type="date"
                  placeholder="Enter date opened"
                  className="form-control"
                  value={moment(createdAt).format("YYYY-MM-DD")}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-md-3 col-form-label d-flex justify-content-end align-items-center">
                Time opened
              </label>
              <div className="col-md-7">
                <input
                  name="createdTime"
                  value={moment(createdTime.toDate()).format("HH:mm")}
                  type="time"
                  placeholder="Enter time opened"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group row">
              <label className="col-md-3 col-form-label d-flex justify-content-end align-items-center">
                Price
              </label>
              <div className="col-md-7">
                <input
                  type="number"
                  placeholder="Enter price"
                  className="form-control"
                  name="price"
                  value={price}
                />
              </div>
            </div>

            <hr />

            <div className="form-group row">
              <label className="col-md-3 col-form-label d-flex justify-content-between align-items-center">
                <div className="">
                  <input type="checkbox" />
                </div>
                Take Profit
              </label>
              <div className="col-md-7">
                <input
                  type="number"
                  placeholder="Enter price"
                  className="form-control"
                  value={tp}
                  name="tp"
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-md-3 col-form-label d-flex justify-content-end align-items-center"></label>
              <div className="col-md-7">
                <input
                  type="number"
                  placeholder="Enter price"
                  className="form-control"
                  value={tp}
                  name="tp"
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-md-3 col-form-label d-flex justify-content-between align-items-center">
                <div className="">
                  <input type="checkbox" />
                </div>
                Stop loss
              </label>
              <div className="col-md-7">
                <input
                  value={sl}
                  name="sl"
                  type="number"
                  placeholder="Enter stop loss"
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-md-3 col-form-label d-flex justify-content-end align-items-center"></label>
              <div className="col-md-7">
                <input
                  value={sl}
                  name="sl"
                  type="number"
                  placeholder="Enter stop loss"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-12">
              <Button type="submit" className="px-5 w-100">
                Save
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditOrder;
