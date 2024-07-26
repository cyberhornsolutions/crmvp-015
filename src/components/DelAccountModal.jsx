import { Button, Form, Modal } from "react-bootstrap";
import { getManagerSettings } from "../utills/helpers";
import { toast } from "react-toastify";
import { updateUserById } from "../utills/firebaseHelpers";
import { useSelector } from "react-redux";
import { useState } from "react";

const DelAccountModal = ({ selectedUser, setShowModal }) => {
  const user = useSelector((state) => state?.user?.user);
  const managers = useSelector((state) => state.managers);
  const managerSettings = getManagerSettings(managers, user.id);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = () => setShowModal(false);

  const handleClick = async () => {
    setIsLoading(true);
    if (!password.trim()) {
      toast.error("Password can't be empty");
      setIsLoading(false);
      return;
    }
    let accounts = JSON.parse(JSON.stringify(selectedUser?.accounts ?? []));
    if (accounts.length === 0) {
      toast.error("No account found");
      closeModal();
      return;
    }
    let acc = accounts.findIndex((a) => a.account_no === selectedUser.id);
    if (accounts[acc].isDefault) {
      accounts.forEach((a) => {
        if (a.account_no !== selectedUser.id) {
          a.isDefault = true;
          return;
        }
      });
      accounts[acc].isDefault = false;
      accounts[acc].isDeleted = true;
    } else {
      accounts[acc].isDeleted = true;
    }
    if (password === selectedUser.password) {
      try {
        await updateUserById(selectedUser.userId, { accounts });
        toast.success("Account deleted successfully");
      } catch (e) {
        console.error(e);
        toast.error("Failed to delete account");
      }
      closeModal();
    } else {
      toast.error("Password does not match");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal backdrop="static" show onHide={closeModal} size="sm" centered>
        <Modal.Header className="text-center" closeButton>
          Delete Account
        </Modal.Header>
        {managerSettings?.deletePlayerAccount ? (
          <>
            <Modal.Body className="border-0 pb-0">
              <Form.Control
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                type="password"
                value={password}
              />
              <small className="form-text text-muted">
                Enter player password to delete account.
              </small>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button onClick={() => closeModal()} variant="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleClick}
                variant="danger"
                disabled={isLoading}
              >
                Delete
              </Button>
            </Modal.Footer>
          </>
        ) : (
          "You do not have permission to perform this action."
        )}
      </Modal>
    </>
  );
};

export default DelAccountModal;
