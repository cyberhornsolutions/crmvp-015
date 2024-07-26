import { convertTimestamptToDate } from "../../utills/helpers";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form } from "react-bootstrap";

const statusColumns = (
  {
    handleChangeStatus,
    handleSaveStatus,
    selectedRowRef,
    setSelectedRow,
    toggleDisableStatus,
    managerSettings,
  } = {
    handleChangeStatus: () => {},
    handleSaveStatus: () => {},
    setSelectedRow: () => {},
    toggleDisableStatus: () => {},
    managerSettings: {},
  }
) => [
  {
    name: "Status",
    selector: (row) =>
      row.isEdit ? (
        <Form.Control
          name="status"
          onChange={(e) =>
            handleChangeStatus(row.id, e.target.name, e.target.value)
          }
          type="text"
          value={row.status}
        />
      ) : (
        row.status
      ),
  },
  {
    name: "Date created",
    selector: (row) => row.createdAt && convertTimestamptToDate(row.createdAt),
  },
  {
    name: "Actions",
    selector: (row) => row.id,
    cell: (row) => (
      <div className="d-flex align-items-center gap-1">
        {row.isEdit ? (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              selectedRowRef.current = null;
              handleSaveStatus(row);
            }}
            title="Save"
          >
            <FontAwesomeIcon icon={faSave} style={{ pointerEvents: "none" }} />
          </button>
        ) : (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={(e) => {
              selectedRowRef.current =
                e.target.parentElement.parentElement.parentElement;
              setSelectedRow(row);
              handleChangeStatus(row.id, "isEdit", true);
            }}
            title="Edit"
            disabled={!managerSettings?.createEditStatus}
          >
            <FontAwesomeIcon
              icon={faEdit}
              onclick
              style={{ pointerEvents: "none" }}
            />
          </button>
        )}
        <Form.Check
          checked={row.isActive}
          disabled={!managerSettings?.createEditStatus}
          onChange={(e) => toggleDisableStatus(row.id, e.target.checked)}
          title="Active"
          type="switch"
        />
      </div>
    ),
  },
];

export default statusColumns;
