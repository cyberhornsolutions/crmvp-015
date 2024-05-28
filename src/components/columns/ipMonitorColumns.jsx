import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { Form } from "react-bootstrap";
import { convertTimestamptToDate } from "../../utills/helpers";

const ipMonitorsColumns = (
  { handleChangeIp, handleSaveIps, toggleDisableIp } = {
    handleChangeIp: () => {},
    handleSaveIps: () => {},
    toggleDisableIp: () => {},
  }
) => [
  {
    name: "First IP", // Translate the header using your t function
    selector: (row) =>
      row.isEdit ? (
        <Form.Control
          type="text"
          value={row.firstIp}
          name="firstIp"
          onChange={(e) =>
            handleChangeIp(row.id, e.target.name, e.target.value)
          }
        />
      ) : (
        row.name
      ),
    sortable: true,
  },
  {
    name: "Second IP", // Translate the header using your t function
    selector: (row) =>
      row.isEdit ? (
        <Form.Control
          type="text"
          value={row.secondIp}
          name="secondIp"
          onChange={(e) =>
            handleChangeIp(row.id, e.target.name, e.target.value)
          }
        />
      ) : (
        row.name
      ),
    sortable: true,
  },
  {
    name: "Action",
    selector: (row) => row.id,
    cell: (row) => (
      <div className="d-flex align-items-center gap-1">
        {row.isEdit ? (
          <FontAwesomeIcon
            icon={faSave}
            className="btn btn-secondary btn-sm"
            onClick={() => handleSaveIps(row)}
          />
        ) : (
          <FontAwesomeIcon
            icon={faEdit}
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handleChangeIp(row.id, "isEdit", true)}
          />
        )}
        <Form.Check
          type="switch"
          checked={row.isActive}
          onChange={(e) => toggleDisableIp(row.id, e.target.checked)}
        />
      </div>
    ),
    sortable: false,
  },
];

export default ipMonitorsColumns;
