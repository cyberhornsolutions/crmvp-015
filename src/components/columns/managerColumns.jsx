import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { Form } from "react-bootstrap";
import { convertTimestamptToDate } from "../../utills/helpers";

const managerColumns = (
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
    width: "4%",
  },
  {
    name: "Login",
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
    width: "8%",
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
    name: "Surname",
    selector: (row) =>
      row.isEdit ? (
        <Form.Control
          type="text"
          value={row.surname}
          name="surname"
          onChange={(e) =>
            handleChangeManager(row.id, e.target.name, e.target.value)
          }
        />
      ) : (
        row.surname
      ),
    sortable: true,
  },
  {
    name: "Email",
    selector: (row) =>
      row.isEdit ? (
        <Form.Control
          type="email"
          value={row.email}
          name="email"
          onChange={(e) =>
            handleChangeManager(row.id, e.target.name, e.target.value)
          }
        />
      ) : (
        row.email
      ),
    width: "10%",
    wrap: true,
  },
  {
    name: "Last active",
    selector: (row) =>
      row.lastActive && convertTimestamptToDate(row.lastActive),
  },
  {
    name: "IP",
    selector: (row) => row && row.ip,
  },
  {
    name: "Password",
    selector: (row) =>
      row &&
      (row.isEdit ? (
        <Form.Control
          type="password"
          value={row.password}
          name="password"
          onChange={(e) =>
            handleChangeManager(row.id, e.target.name, e.target.value)
          }
        />
      ) : (
        "****" // row.password
      )),
  },
  {
    name: "Last modified",
    selector: (row) => row.updatedAt && convertTimestamptToDate(row.updatedAt),
    width: "10%",
    compact: true,
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
            <option key={i} value={team.id}>
              {team.name}
            </option>
          ))}
        </Form.Select>
      ) : (
        teams.find((t) => t.id === row.team)?.name
      ),
    sortable: true,
  },
  {
    name: "Date created",
    selector: (row) => row.date && convertTimestamptToDate(row.date),
    compact: true,
    width: "10%",
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
  },
];

export default managerColumns;
