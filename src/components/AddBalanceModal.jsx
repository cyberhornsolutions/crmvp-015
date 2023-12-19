import { Modal, Form } from "react-bootstrap";
import { addUserNewBalance } from "../utills/firebaseHelpers";
import { useState } from "react";

function AddBalanceModal({
  setShowModal,
  fetchUsers,
  selectedUser,
  setSelectedUser,
}) {
  const [newBalance, setNewBalance] = useState(0);
  const [balanceType, setBalanceType] = useState("Bonus");

  const handleAddNewBalance = async (amount) => {
    try {
      await addUserNewBalance(selectedUser.id, amount, balanceType);
      if (fetchUsers && setSelectedUser) {
        setSelectedUser({});
        fetchUsers();
      }
      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal show onHide={setShowModal}>
      <Modal.Header closeButton>Add Balance</Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Balance</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter balance"
            value={newBalance}
            onChange={(e) => {
              const { value } = e.target;
              if (value >= 0) setNewBalance(value);
            }}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Type</Form.Label>
          <Form.Select
            aria-label="Default select example"
            value={balanceType}
            onChange={(e) => setBalanceType(e.target.value)}
          >
            <option value="Bonus">Bonus</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdraw">Withdraw</option>
          </Form.Select>
        </Form.Group>
        <button
          className="btn btn-primary mt-3"
          onClick={() => {
            if (!newBalance) {
              toast.error("Please enter amount");
            } else {
              handleAddNewBalance(newBalance);
            }
          }}
        >
          Add Balance
        </button>
      </Modal.Body>
    </Modal>
  );
}

export default AddBalanceModal;
