import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const ChangeManagerPasswordModal = ({
  closeModal,
  handleIsPasswordConfirmed,
  handleSaveManager,
  managerInfo,
}) => {
  const [repeatPassword, setRepeatPassword] = useState("");

  const handleClick = () => {
    if (repeatPassword === managerInfo.password) {
      handleIsPasswordConfirmed();
      handleSaveManager(managerInfo);
      closeModal();
    } else {
      toast.error("Password does not match");
    }
  };

  return (
    <>
      <Modal
        backdrop="static"
        show
        onHide={() => closeModal(true)}
        size="sm"
        centered
      >
        <Modal.Header className="text-center" closeButton>
          Save changes
        </Modal.Header>
        <Modal.Body className="border-0 pb-0">
          <Form.Control
            name="repeatPassword"
            onChange={(e) => {
              setRepeatPassword(e.target.value);
            }}
            placeholder="Repeat password"
            type="password"
            value={repeatPassword}
          />
          <small className="form-text text-muted">
            Repeat your password in order to save the changes.
          </small>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            className="px-3"
            onClick={() => closeModal(true)}
            size="sm"
            variant="danger"
          >
            Cancel
          </Button>
          <Button
            className="px-3"
            onClick={handleClick}
            size="sm"
            variant="success"
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChangeManagerPasswordModal;
