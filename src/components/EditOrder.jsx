import React from "react";
import { Button, Modal } from "react-bootstrap";

const EditOrder = ({ onClose, show, selectedOrder }) => {
  console.log(888, selectedOrder);
  return (
    <>
      <Modal size="md" show={show} onHide={onClose} className="" centered>
        <Modal.Header
          className="bg-transparent border-0 rounded-0 text-center p-1 pb-0 align-items-center"
          closeButton
        >
          <div className="d-flex justify-content-center align-items-center">
            <h5>Order Editing-{selectedOrder?.symbol}</h5>
          </div>
        </Modal.Header>
        <Modal.Body className=" d-flex flex-column gap-3 p-3 pt-0">
          <div className="d-flex flex-column justify-content-center align-items-center gap-2">
            <div>
              <label>Volume</label>
              <input placeholder="Enter volume" />
            </div>
            <div>
              <label>Date opened</label>
              <input placeholder="Enter date opened" />
            </div>
            <div>
              <label>Time opened</label>
              <input placeholder="Enter time opened" />
            </div>
            <div>
              <label>Price</label>
              <input placeholder="Enter price" />
            </div>

            <div>
              <label>Time opened</label>
              <input placeholder="Enter volume" />
            </div>

            <div className="w-100">
              <Button className="px-5">Save</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditOrder;
