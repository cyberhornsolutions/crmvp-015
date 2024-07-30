import { fillArrayWithEmptyRows } from "../utills/helpers";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import logColumns from "./columns/logColumns";

const LogsModal = ({ selectedUser, setShowModal }) => {
  const logs = useSelector((state) =>
    state.playerLogs.filter((l) => l.userId === selectedUser.userId)
  );

  const onClose = () => setShowModal(false);

  return (
    <>
      <Modal centered fullscreen={true} onHide={onClose} show>
        <Modal.Header closeButton>
          <h3 className="mb-0 text-center w-100">Logs Explorer</h3>
        </Modal.Header>
        <Modal.Body>
          <DataTable
            columns={logColumns}
            customStyles={{
              headCells: {
                style: {
                  fontSize: "medium",
                },
              },
              rows: {
                style: {
                  fontSize: "small",
                },
              },
            }}
            data={fillArrayWithEmptyRows(logs, 10)}
            pagination
            paginationRowsPerPageOptions={[5, 10, 15, 20, 50]}
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn px-4 py-1 rounded btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LogsModal;
