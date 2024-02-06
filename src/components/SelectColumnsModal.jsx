import { Modal, Form } from "react-bootstrap";

const SelectColumnsModal = ({
  setModal,
  columns,
  setColumns = () => {},
  position = "",
} = {}) => {
  const closeModal = () => setModal(false);

  return (
    <Modal
      show
      onHide={closeModal}
      dialogClassName={`position-absolute ${
        position ? position : "columns-modal"
      }`}
      backdropClassName="opacity-0"
      animation
      keyboard
      size="sm"
    >
      <Modal.Header className="py-1 ">Show/Hide Columns</Modal.Header>
      <Modal.Body className="py-1">
        {Object.keys(columns).map((column) => {
          return (
            <Form.Check
              label={column}
              className="text-left"
              checked={columns[column]}
              onChange={(e) =>
                setColumns((p) => ({ ...p, [column]: e.target.checked }))
              }
            />
          );
        })}
      </Modal.Body>
    </Modal>
  );
};

export default SelectColumnsModal;
