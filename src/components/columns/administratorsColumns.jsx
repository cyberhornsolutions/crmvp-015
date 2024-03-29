import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { Form } from "react-bootstrap";
import { convertTimestamptToDate } from "../../utills/helpers";

const administratorsColumns = (
  { handleChangeManager, handleSaveManager, toggleActiveManager, teams } = {
    handleChangeManager: () => {},
    handleSaveManager: () => {},
    toggleActiveManager: () => {},
    teams: [],
  }
) => [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
    grow: 0.5,
  },
  {
    name: "Name", // Translate the header using your t function
    selector: (row) =>
      row.isEdit ? (
        <Form.Control
          type="text"
          value={row.name}
          name="name"
          onChange={(e) =>
            handleChangeManager(row.id, e.target.name, e.target.value)
          }
        />
      ) : (
        row.name
      ),
    sortable: true,
  },
  {
    name: "Username",
    selector: (row) =>
      row.isEdit ? (
        <Form.Control
          type="text"
          value={row.username}
          name="username"
          onChange={(e) =>
            handleChangeManager(row.id, e.target.name, e.target.value)
          }
        />
      ) : (
        row.username
      ),
    sortable: true,
  },
  {
    name: "Role",
    selector: (row) =>
      row.isEdit ? (
        <Form.Select
          type="text"
          name="role"
          value={row.role}
          placeholder="Role"
          onChange={(e) =>
            handleChangeManager(row.id, e.target.name, e.target.value)
          }
        >
          <option value="Admin">Admin</option>
          <option value="Sale">Sale</option>
          <option value="Reten">Reten</option>
        </Form.Select>
      ) : (
        row.role
      ),
    sortable: true,
  },
  {
    name: "Team",
    selector: (row) =>
      row.isEdit ? (
        <Form.Select
          type="text"
          name="team"
          value={row.team}
          placeholder="Team"
          onChange={(e) =>
            handleChangeManager(row.id, e.target.name, e.target.value)
          }
        >
          {teams.map((team, i) => (
            <option key={i} value={team.name}>
              {team.name}
            </option>
          ))}
        </Form.Select>
      ) : (
        row.team
      ),
    sortable: true,
  },
  {
    name: "Date",
    selector: (row) => row.date && convertTimestamptToDate(row.date),
    sortable: true,
    grow: 1.5,
    compact: true,
  },
  {
    name: "Action",
    selector: (row) => row.id,
    cell: (row) =>
      row && (
        <div className="d-flex align-items-center gap-1">
          {row.isEdit ? (
            <FontAwesomeIcon
              icon={faSave}
              className="btn btn-secondary btn-sm"
              onClick={() => handleSaveManager(row)}
            />
          ) : (
            <FontAwesomeIcon
              icon={faEdit}
              className="btn btn-outline-secondary btn-sm"
              onClick={() => handleChangeManager(row.id, "isEdit", true)}
            />
          )}
          <Form.Check
            type="switch"
            checked={row.isActive}
            onChange={(e) => toggleActiveManager(row.id, e.target.checked)}
          />
        </div>
      ),
    sortable: false,
  },
];

export default administratorsColumns;
