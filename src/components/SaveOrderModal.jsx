import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { deleteDocument, updateUserById } from "../utills/firebaseHelpers";

const SaveOrderModal = ({ closeModal, handleSaveOrder }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Modal
        backdrop="static"
        show
        onHide={() => closeModal(true)}
        size="sm"
        centered
      >
        <Modal.Header className="text-center " closeButton>
          Save order
        </Modal.Header>
        <Modal.Body className="border-0 pb-0">
          Are you sure to save these changes?
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            className="px-3"
            variant="secondary"
            onClick={() => closeModal(true)}
            size="sm"
          >
            No
          </Button>
          <Button
            className="px-3"
            variant="danger"
            onClick={handleSaveOrder}
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

export default SaveOrderModal;
