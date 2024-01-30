import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { deleteDocument } from "../utills/firebaseHelpers";

const CancelOrderModal = ({ setShow, selectedOrder }) => {
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = () => setShow(false);
  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      await deleteDocument("orders", selectedOrder.id);
      toast.success("Order cancelled");
      closeModal();
    } catch (error) {
      toast.error("Failed to Cancel order");
      console.log("Error", error.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal show onHide={closeModal} centered>
        <Modal.Header className="text-center" closeButton>
          Cancel order -- {selectedOrder?.id} + {selectedOrder?.symbol}
        </Modal.Header>
        <Modal.Body className="border-0 pb-0">
          Are you sure to cancel this order?
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            className="px-3"
            variant="secondary"
            onClick={closeModal}
            size="sm"
          >
            No
          </Button>
          <Button
            className="px-3"
            variant="danger"
            onClick={handleCancelOrder}
            size="sm"
            disabled={isLoading}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CancelOrderModal;
