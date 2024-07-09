import { addNewAssetGroup } from "../utills/firebaseHelpers";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useState } from "react";

const AddNewGroupModal = ({ closeModal }) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    closedMarket: false,
    title: "",
  });

  const handleClick = async () => {
    setLoading(true);
    if (!formData.title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    try {
      await addNewAssetGroup(formData);
      closeModal();
      toast.success("New asset group added successfully");
    } catch (e) {
      console.log("🚀 -> handleClick -> e:", e);
    }
  };

  return (
    <Modal backdrop="static" centered onHide={closeModal} show size="sm">
      <Modal.Header className="text-center " closeButton>
        Add new group
      </Modal.Header>
      <Modal.Body className="border-0 pb-0">
        <Form className="row row-gap-3" onSubmit={closeModal}>
          <Form.Group className="row align-items-center mb-2">
            <Form.Label className="col-4" htmlFor="title">
              Title
            </Form.Label>
            <div className="col">
              <Form.Control
                id="title"
                name="title"
                onChange={(e) => {
                  setLoading(false);
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  });
                }}
                placeholder="Title"
                required
                type="text"
                value={formData.title}
              />
            </div>
          </Form.Group>
          <Form.Group className="d-flex align-items-center gap-2 ml-8">
            <Form.Label className="mb-0" htmlFor="closed-trading">
              Closed market trading
            </Form.Label>
            <Form.Check
              checked={formData.closedMarket}
              id="closed-trading"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  closedMarket: e.target.checked,
                });
              }}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button
          className="px-3"
          onClick={closeModal}
          size="sm"
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          className="px-3"
          disabled={loading}
          onClick={handleClick}
          size="sm"
          variant="danger"
        >
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddNewGroupModal;
