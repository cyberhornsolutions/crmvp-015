import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useState } from "react";

const ChangeManagerPasswordModal = ({
  setShowModal,
  handleSaveManager,
  manager,
}) => {
  const [repeatPassword, setRepeatPassword] = useState("");

  const closeModal = () => setShowModal(false);

  const handleClick = () => {
    if (repeatPassword === manager.password) {
      handleSaveManager(manager, true);
      closeModal();
    } else {
      toast.error("Password does not match");
    }
  };

  return (
    <>
      <Modal backdrop="static" show onHide={closeModal} size="sm" centered>
        <Modal.Header className="text-center" closeButton>
          Confirm Password
        </Modal.Header>
        <Modal.Body className="border-0 pb-0">
          <Form.Control
            onChange={(e) => setRepeatPassword(e.target.value)}
            placeholder="Repeat password"
            type="password"
            value={repeatPassword}
          />
          <small className="form-text text-muted">
            Repeat your password to save the changes.
          </small>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button onClick={() => closeModal(true)} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleClick}
            variant="danger"
            disabled={!repeatPassword}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChangeManagerPasswordModal;
