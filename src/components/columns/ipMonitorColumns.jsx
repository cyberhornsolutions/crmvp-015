import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { Form } from "react-bootstrap";

const ipMonitorsColumns = (
  { handleChangeIps, handleSaveIps, toggleDisableIp } = {
    handleChangeIps: () => {},
    handleSaveIps: () => {},
    toggleDisableIp: () => {},
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
          <FontAwesomeIcon
            icon={faSave}
            title="Save"
            className="btn btn-secondary btn-sm"
            onClick={() => handleSaveIps(row)}
          />
        ) : (
          <FontAwesomeIcon
            icon={faEdit}
            title="Edit"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handleChangeIps(row.id, "isEdit", true)}
          />
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
