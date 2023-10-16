import React from "react";

export default function Users() {
  const addUser = () => {
    var name = document.getElementById("newUserName").value;
    var email = document.getElementById("newUserEmail").value;
    var pos = document.getElementById("newUserPosition").value;
    var desk = document.getElementById("newUserDesk").value;

    var table = document
      .getElementById("users-table")
      .getElementsByTagName("tbody")[0];
    var newRow = table.insertRow(table.rows.length);
    var cell1 = newRow.insertCell(0);
    var cellID = newRow.insertCell(1);
    var cell2 = newRow.insertCell(2);
    var cell3 = newRow.insertCell(3);
    var cell4 = newRow.insertCell(4);
    var cell5 = newRow.insertCell(5);
    var cell6 = newRow.insertCell(6);

    const randomNum = Math.floor(Math.random() * 100) + 1;

    cell1.innerHTML = '<input type="checkbox">';
    cellID.innerHTML = randomNum;
    cell2.innerHTML = name;
    cell3.innerHTML = email;
    cell4.innerHTML = pos;
    cell5.innerHTML = desk;

    // Create a new Date object for the current date and time
    const currentDate = new Date();

    // Extract the year, month, and day components
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Month is 0-based, so add 1
    const day = currentDate.getDate();

    // Create a formatted date string in YYYY-MM-DD format
    const formattedDate = `${year}-${month < 10 ? "0" : ""}${month}-${
      day < 10 ? "0" : ""
    }${day}`;

    cell6.innerHTML = formattedDate;
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

  return (
    <div id="users" className="active">
      <div
        id="users-div"
        // className="hidden"
      >
        <div
          className="dropdown"
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: 10,
            // height: 25,
          }}
        >
          {/* <button
            className="btn dropdown-toggle"
            type="button"
            id="usersDropdown"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            Search
          </button>
          <div className="dropdown-menu" aria-labelledby="usersDropdown">
            <a
              className="dropdown-item text-center"
              href="#"
              data-option="By name"
            >
              By name
            </a>
            <a
              className="dropdown-item text-center"
              href="#"
              data-option="By email"
            >
              By email
            </a>
            <a
              className="dropdown-item text-center"
              href="#"
              data-option="By position"
            >
              By position
            </a>
            <a
              className="dropdown-item text-center"
              href="#"
              data-option="By desk"
            >
              By desk
            </a>
          </div> */}
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
        <table id="users-table" className="table table-hover table-striped">
          <thead>
            <tr>
              <th className="text-center" scope="col"></th>
              <th className="text-center" scope="col">
                ID
              </th>
              <th className="text-center" scope="col">
                Name
              </th>
              <th className="text-center" scope="col">
                Email
              </th>
              <th className="text-center" scope="col">
                Position
              </th>
              <th className="text-center" scope="col">
                Desk
              </th>
              <th className="text-center" scope="col">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input type="checkbox" />
              </td>
              <td>1</td>
              <td>Jason Bandera</td>
              <td>testmail@gmail.com</td>
              <td>Sale</td>
              <td>Demo</td>
              <td>2023-09-03</td>
            </tr>
            <tr>
              <td>
                <input type="checkbox" />
              </td>
              <td>2</td>
              <td>Antony Obama</td>
              <td>testmail2@gmail.com</td>
              <td>Admin</td>
              <td>Demo</td>
              <td>2023-08-13</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        id="newUser-form"
        // className="hidden"
      >
        <h5>Managers</h5>
        <form id="addNewUser">
          <div id="new-user-fields">
            <input type="text" placeholder="Name" id="newUserName" />
            <input type="email" placeholder="Email" id="newUserEmail" />
            <input type="text" placeholder="Position" id="newUserPosition" />
            <input type="text" placeholder="Desk" id="newUserDesk" />
          </div>
        </form>
        <div>
          <button
            className="btn btn-secondary"
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
