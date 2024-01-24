import { Modal, Form } from "react-bootstrap";
import { addNewDepsit, updateUserById } from "../utills/firebaseHelpers";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function AddBalanceModal({ setShowModal }) {
  const [newBalance, setNewBalance] = useState(0);
  const [balanceType, setBalanceType] = useState("Bonus");
  const { selectedUser, user } = useSelector((state) => state.user);

  const handleAddNewBalance = async (amount) => {
    const newDeposit = {
      player: selectedUser.name,
      userId: selectedUser.id,
      type: balanceType,
      sum: amount,
      method: "VISA",
      manager: user.username,
      team: user.team || "",
      desk: user.desk || "",
    };

    let userKey = "bonus";
    if (selectedUser?.settings?.allowBonus) userKey = "totalBalance";

    const userPayload = {
      [userKey]: selectedUser[userKey] + newBalance,
    };

    try {
      await addNewDepsit(newDeposit);
      await updateUserById(selectedUser.id, userPayload);
      toast.success("Balance added successfully");
      setShowModal(false);
    } catch (error) {
      toast.error("Failed");
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const minDeposit = selectedUser?.settings?.minDeposit;
    if (!newBalance) {
      toast.error("Please enter amount");
    } else if (newBalance < +minDeposit) {
      toast.error(`Minimum Deposit amount for this player is ${minDeposit}`);
    } else {
      handleAddNewBalance(newBalance);
    }
  };

  return (
    <Modal show onHide={setShowModal} centered>
      <Modal.Header closeButton>
        <h5 className="m-0">Add Balance</h5>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="row mb-3">
            <div className="col-3">
              <Form.Label htmlFor="balance">Balance</Form.Label>
            </div>
            <div className="col">
              <Form.Control
                id="balance"
                type="number"
                placeholder="Enter balance"
                required
                value={newBalance}
                onChange={(e) => {
                  const { value } = e.target;
                  if (value >= 0) setNewBalance(parseFloat(value));
                }}
              />
            </div>
          </Form.Group>
          <Form.Group className="row mb-3">
            <div className="col-3">
              <Form.Label htmlFor="balance-type">Type</Form.Label>
            </div>
            <div className="col">
              <Form.Select
                id="balance-type"
                aria-label="Default select example"
                required
                value={balanceType}
                onChange={(e) => setBalanceType(e.target.value)}
              >
                <option value="Bonus">Bonus</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdraw">Withdraw</option>
              </Form.Select>
            </div>
          </Form.Group>
          <button className="btn btn-primary w-100 " type="submit">
            Add Balance
          </button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddBalanceModal;
