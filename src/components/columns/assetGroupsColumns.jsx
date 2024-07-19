import { convertTimestamptToDate } from "../../utills/helpers";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form } from "react-bootstrap";

const assetGroupsColumns = (
  {
    handleChangeAssetGroups,
    handleSaveAssetGroups,
    selectedRowRef,
    setSelectedRow,
    toggleDisableAssetGroups,
  } = {
    handleChangeAssetGroups: () => {},
    handleSaveAssetGroups: () => {},
    setSelectedRow: () => {},
    toggleDisableAssetGroups: () => {},
  }
) => [
  {
    name: "Title",
    selector: (row) =>
      row.isEdit ? (
        <Form.Control
          name="title"
          onChange={(e) =>
            handleChangeAssetGroups(row.id, e.target.name, e.target.value)
          }
          type="text"
          value={row.title}
        />
      ) : (
        row.title
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
              handleSaveAssetGroups(row);
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
              handleChangeAssetGroups(row.id, "isEdit", true);
            }}
            title="Edit"
          >
            <FontAwesomeIcon
              icon={faEdit}
              onclick
              style={{ pointerEvents: "none" }}
            />
          </button>
        )}
        <Form.Check
          checked={row.closedMarket}
          onChange={(e) => toggleDisableAssetGroups(row.id, e.target.checked)}
          title="closedMarket"
          type="switch"
        />
      </div>
    ),
  },
];

export default assetGroupsColumns;
