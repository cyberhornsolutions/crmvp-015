import { Button, Modal } from "react-bootstrap";

const SaveUserInfoModal = ({ closeModal, handleSaveInfo }) => {
  return (
    <>
      <Modal backdrop="static" centered onHide={closeModal} show size="sm">
        <Modal.Header className="text-center " closeButton>
          Save info
        </Modal.Header>
        <Modal.Body className="border-0 pb-0">
          Are you sure to save these changes?
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            className="px-3"
            onClick={closeModal}
            size="sm"
            variant="secondary"
          >
            No
          </Button>
          <Button
            className="px-3"
            onClick={handleSaveInfo}
            size="sm"
            variant="danger"
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SaveUserInfoModal;
