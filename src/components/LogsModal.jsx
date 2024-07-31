import { fillArrayWithEmptyRows, getManagerSettings } from "../utills/helpers";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import logColumns from "./columns/logColumns";

const LogsModal = ({ selectedUser, setShowModal, type }) => {
  const user = useSelector((state) => state?.user?.user);
  const managers = useSelector((state) => state.managers);
  const managerSettings = getManagerSettings(managers, user.id);

  const logs = useSelector((state) =>
    type === "Manager"
      ? state.managerLogs.filter((l) => l.userId === selectedUser.id)
      : state.playerLogs.filter((l) => l.userId === selectedUser.userId)
  );

  const onClose = () => setShowModal(false);

  return (
    <>
      <Modal centered fullscreen={true} onHide={onClose} show>
        <Modal.Header closeButton>
          <h3 className="mb-0 text-center w-100">{type} logs</h3>
        </Modal.Header>
        <Modal.Body>
          {managerSettings?.playerLogs ? (
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
          ) : (
            "You do not have permission to perform this action."
          )}
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
