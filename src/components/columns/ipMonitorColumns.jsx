import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { Form } from "react-bootstrap";

const ipMonitorsColumns = (
  {
    handleChangeIps,
    handleSaveIps,
    toggleDisableIp,
    selectedRowRef,
    setSelectedRow,
  } = {
    handleChangeIps: () => {},
    handleSaveIps: () => {},
    toggleDisableIp: () => {},
    setSelectedRow: () => {},
  }
) => [
  {
    name: "First IP",
    selector: (row) =>
      row.isEdit ? (
        <Form.Control
          type="text"
          value={row.firstIp}
          name="firstIp"
          onChange={(e) =>
            handleChangeIps(row.id, e.target.name, e.target.value)
          }
        />
      ) : (
        row.firstIp
      ),
  },
  {
    name: "Second IP",
    selector: (row) =>
      row.isEdit ? (
        <Form.Control
          type="text"
          value={row.secondIp}
          name="secondIp"
          onChange={(e) =>
            handleChangeIps(row.id, e.target.name, e.target.value)
          }
        />
      ) : (
        row.secondIp
      ),
  },
  {
    name: "Action",
    selector: (row) => row.id,
    cell: (row) => (
      <div className="d-flex align-items-center gap-1">
        {row.isEdit ? (
          <button
            title="Save"
            className="btn btn-secondary btn-sm"
            onClick={() => handleSaveIps(row)}
          >
            <FontAwesomeIcon
              icon={faSave}
              style={{
                pointerEvents: "none",
              }}
            />
          </button>
        ) : (
          <button
            title="Edit"
            className="btn btn-outline-secondary btn-sm"
            onClick={(e) => {
              selectedRowRef.current =
                e.target.parentElement.parentElement.parentElement;
              setSelectedRow(row);
              handleChangeIps(row.id, "isEdit", true);
            }}
          >
            <FontAwesomeIcon
              icon={faEdit}
              style={{
                pointerEvents: "none",
              }}
              onclick
            />
          </button>
        )}
        <Form.Check
          type="switch"
          checked={row.isBlocked}
          title="Blocked"
          onChange={(e) => toggleDisableIp(row.id, e.target.checked)}
        />
      </div>
    ),
  },
];

export default ipMonitorsColumns;
