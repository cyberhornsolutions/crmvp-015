import { Button, Form, Modal } from "react-bootstrap";

const AddNewGroupModal = ({ closeModal }) => {
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
                disabled
                id="title"
                name="title"
                placeholder="Title"
                required
                type="text"
              />
            </div>
          </Form.Group>
          <Form.Group className="row align-items-center mb-2">
            <Form.Label className="col-4" htmlFor="market-open">
              Market open
            </Form.Label>
            <div className="col">
              <Form.Control
                disabled
                id="market-open"
                type="text"
                value="Mon-Fri: 9AM-23PM"
              />
            </div>
          </Form.Group>
          <Form.Group className="d-flex align-items-center gap-3 pt-2">
            <Form.Label className="mb-0" htmlFor="closed-trading">
              Closed market trading
            </Form.Label>
            <Form.Check checked id="closed-trading" />
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
          No
        </Button>
        <Button
          className="px-3"
          onClick={closeModal}
          size="sm"
          variant="danger"
        >
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddNewGroupModal;
