import React, { useEffect, useState } from "react";
import { Nav, Navbar } from "react-bootstrap";
import { auth, db } from "../firebase";
import { addDoc, collection, query, onSnapshot } from "firebase/firestore";
import DataTable from "react-data-table-component";

export default function Users() {
  const [tab, setTab] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [desk, setDesk] = useState("");
  const [managers, setManagers] = useState([]);
  const [originalManagers, setOriginalManagers] = useState([]);

  const addUser = async () => {
    try {
      const formattedDate = new Date().toLocaleDateString("en-US");
      const docRef = await addDoc(collection(db, "managers"), {
        name,
        email,
        role,
        desk,
        date: formattedDate,
      });
      console.log("Manager Record Added Successfully.!", docRef);
      setName("");
      setEmail("");
      setDesk("");
      setRole("");
    } catch (error) {
      console.log("Error While Adding The Manager Record : ", error);
    }
  };
  const fetchManagers = async () => {
    try {
      const q = query(collection(db, "managers"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const managerData = [];
        let index = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          index += 1;
          managerData.push({
            index,
            id: doc.id,
            ...data,
          });
        });
        setManagers(managerData);
        setOriginalManagers(managerData);
      });
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };
  const columns = [
    {
      name: "ID",
      selector: (row) => row.index,
    },
    {
      name: "Name", // Translate the header using your t function
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Position",
      selector: (row) => row.role,
      sortable: true,
    },
    {
      name: "Desk",
      selector: (row) => row.desk,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
    },
  ];
  const filterManagers = (role, tab) => {
    let filteredManagersArray;

    if (role === "All") {
      filteredManagersArray = originalManagers;
    } else {
      filteredManagersArray = originalManagers.filter(
        (manager) => manager.role === role
      );
    }

    setManagers(filteredManagersArray);
    setTab(tab);
  };
  const dataTable = () => {
    return (
      <DataTable
        columns={columns}
        data={managers}
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 20, 50]}
        highlightOnHover
        pointerOnHover
        responsive
      />
    );
  };
  const deleteUser = () => {
    var table = document.getElementById("users-table");
    var checkboxes = table.querySelectorAll(
      'tbody input[type="checkbox"]:checked'
    );
    checkboxes.forEach(function (checkbox) {
      var row = checkbox.closest("tr");
      row.remove();
    });
  };
  useEffect(() => {
    fetchManagers();
  }, []);
  return (
    <div id="users" className="active">
      <div
        id="users-div"
        // className="hidden"
      >
        <Navbar className="nav nav-tabs p-0">
          <Nav className="me-auto" style={{ gap: "2px" }}>
            <Nav.Link
              className={tab === 0 && "active"}
              onClick={() => filterManagers("All", 0)}
            >
              All
            </Nav.Link>
            <Nav.Link
              className={tab === 1 && "active"}
              onClick={() => filterManagers("Sale", 1)}
            >
              Sale
            </Nav.Link>
            <Nav.Link
              className={tab === 2 && "active"}
              onClick={() => filterManagers("Reten", 2)}
            >
              Reten
            </Nav.Link>
            <Nav.Link
              className={tab === 3 && "active"}
              onClick={() => filterManagers("Teams", 3)}
            >
              Teams
            </Nav.Link>
          </Nav>
        </Navbar>
        <div
          className="dropdown"
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: 10,
            // height: 25,
          }}
        >
          <select className="btn dropdown-toggle">
            <option
              className="dropdown-item text-left"
              style={{ display: "none" }}
            >
              Search
            </option>
            <option className="dropdown-item text-left">By name</option>
            <option className="dropdown-item text-left">By email</option>
            <option className="dropdown-item text-left">By position</option>
            <option className="dropdown-item text-left">By desk</option>
          </select>
          <input
            type="text"
            id="usersSearchInput"
            onkeyup="usersSearch()"
            placeholder="Поиск.."
          />
        </div>
        <div className="tab-content">
          {tab === 0 && <div>{dataTable()}</div>}

          {tab === 1 && <div>{dataTable()}</div>}

          {tab === 2 && <div>{dataTable()}</div>}

          {tab === 3 && <div>{dataTable()}</div>}
        </div>
      </div>
      <div
        id="newUser-form"
        // className="hidden"
      >
        <h5>Manage</h5>
        <form id="addNewUser">
          <div id="new-user-fields" className="px-2">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              id="newUserName"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              id="newUserEmail"
            />
            <input
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Position"
              id="newUserPosition"
            />
            <input
              type="text"
              value={desk}
              onChange={(event) => setDesk(event.target.value)}
              placeholder="Desk"
              id="newUserDesk"
            />
          </div>
        </form>
        <div className="mt-3">
          <button
            className="btn btn-secondary me-2"
            id="new-user-del"
            type="button"
            onClick={deleteUser}
          >
            Delete
          </button>
          <button
            className="btn btn-secondary"
            id="new-user-add"
            type="button"
            onClick={addUser}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
