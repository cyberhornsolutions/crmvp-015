import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Dropdown, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

function ChangeManagerModal({ setShowModal }) {
  const managers = useSelector((state) => state.managers);
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const statuses = useSelector((state) => state.statuses);

  const getStatus = (id) => {
    const status = statuses.find((s) => s.id === id);
    return status ? status.status : "";
  };

  const handleChangeManager = async (id, manager) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { manager });
      toast.success("Manager updated successfully");
      setShowModal(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update manager");
      setShowModal(false);
    }
  };

  return (
    <Modal centered onHide={setShowModal} show>
      <Modal.Header closeButton>
        <h5 className="m-0">Change Manager</h5>
      </Modal.Header>
      <Modal.Body>
        <Dropdown>
          <Dropdown.Toggle variant="secondary" className="lh-sm">
            <div>
              {managers.find((m) => m.id === selectedUser.manager)?.username}
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu className="text-center">
            {managers
              .filter(
                (m) =>
                  m.isActive &&
                  (getStatus(selectedUser.status) === "New" ||
                  getStatus(selectedUser.status) === "Sale"
                    ? m.role === "Sale"
                    : m.role === "Reten")
              )
              .map((m, i) => (
                <Dropdown.Item
                  key={i}
                  onClick={() => handleChangeManager(selectedUser.userId, m.id)}
                >
                  {selectedUser.manager === m.id ? <span>&#10004;</span> : ""}{" "}
                  {m.username}
                </Dropdown.Item>
              ))}
          </Dropdown.Menu>
        </Dropdown>
      </Modal.Body>
    </Modal>
  );
}

export default ChangeManagerModal;
