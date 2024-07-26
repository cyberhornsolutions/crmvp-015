import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { Form } from "react-bootstrap";
import { convertTimestamptToDate } from "../../utills/helpers";

const managerColumns = (
  {
    handleChangeManager,
    handleSaveManager,
    toggleActiveManager,
    teams,
    showColumns,
    managerSettings,
  } = {
    handleChangeManager: () => {},
    handleSaveManager: () => {},
    toggleActiveManager: () => {},
    teams: [],
    showColumns: {},
    managerSettings: {},
  }
) => [
  {
    name: "ID",
    selector: (row, i) => row && i + 1,
    width: "4%",
    omit: !showColumns.ID,
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
    omit: !showColumns.Login,
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
    omit: !showColumns.Name,
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
    omit: !showColumns.Surname,
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
    compact: true,
    omit: !showColumns.Email,
  },
  {
    name: "Last active",
    selector: (row) =>
      row.lastActive && convertTimestamptToDate(row.lastActive),
    width: "10%",
    wrap: true,
    omit: !showColumns["Last active"],
  },
  {
    name: "IP",
    selector: (row) => row && row.ip,
    width: "10%",
    compact: true,
    omit: !showColumns.IP,
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
    omit: !showColumns.Password,
  },
  {
    name: "Last modified",
    selector: (row) => row.updatedAt && convertTimestamptToDate(row.updatedAt),
    width: "10%",
    compact: true,
    omit: !showColumns["Last modified"],
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
    omit: !showColumns.Role,
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
    omit: !showColumns.Team,
  },
  {
    name: "Date created",
    selector: (row) => row.date && convertTimestamptToDate(row.date),
    compact: true,
    width: "10%",
    omit: !showColumns["Date created"],
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
              onClick={() =>
                managerSettings?.editManager &&
                handleChangeManager(row.id, "isEdit", true)
              }
              style={{
                cursor: managerSettings?.editManager ? "" : "not-allowed",
                opacity: managerSettings?.editManager ? "" : "0.5",
              }}
            />
          )}
          <Form.Check
            checked={row.isActive}
            disabled={!managerSettings?.disableManager}
            onChange={(e) => toggleActiveManager(row.id, e.target.checked)}
            type="switch"
          />
        </div>
      ),
    omit: !showColumns.Action,
  },
];

export default managerColumns;
