import React, { useEffect } from "react";

export default function Transactions() {
  useEffect(() => {
    console.log("1");
    console.log("2");
    const table = document.getElementById("transactions-table");
    const cells = table.getElementsByTagName("td");

    console.log({ table, cells });

    // Add click event listeners to each cell
    for (let i = 0; i < cells.length; i++) {
      cells[i].addEventListener("click", function () {
        const cell = cells[i];
        console.log(cell[i]);

        // Check if the cell is already in edit mode
        if (!cell.classList.contains("editing")) {
          // Enter edit mode
          const cellValue = cell.innerHTML;
          cell.innerHTML = `<input type="text" value="${cellValue}">`;
          cell.classList.add("editing");

          // Focus on the input field
          const input = cell.querySelector("input");
          input.focus();

          // Save the edited value when the input field loses focus
          input.addEventListener("blur", function () {
            cell.innerHTML = input.value;
            cell.classList.remove("editing");
          });
        }
      });
    }
  }, []);

  return (
    <div id="transactions" className="active">
      <div id="transactions-div">
        <div className="dropdown">
          {/* <button
            className="btn dropdown-toggle"
            type="button"
            id="transactionsDropdown"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            Search
          </button>*/}
          <div>
            <div
              className="dropdown-menu"
              aria-labelledby="transactionsDropdown"
            >
              <a
                className="dropdown-item text-center"
                href="#"
                data-option="By manager"
              >
                By manager
              </a>
              <a
                className="dropdown-item text-center"
                href="#"
                data-option="By date"
              >
                By date
              </a>
              <a
                className="dropdown-item text-center"
                href="#"
                data-option="By player"
              >
                By player
              </a>
              <a
                className="dropdown-item text-center"
                href="#"
                data-option="By status"
              >
                By status
              </a>
              <a
                className="dropdown-item text-center"
                href="#"
                data-option="By desk"
              >
                By desk
              </a>
              <a
                className="dropdown-item text-center"
                href="#"
                data-option="By sum"
              >
                By sum
              </a>
              <a
                className="dropdown-item text-center"
                href="#"
                data-option="By type"
              >
                By type
              </a>
              <a
                className="dropdown-item text-center"
                href="#"
                data-option="By ID"
              >
                By ID
              </a>
              <a
                className="dropdown-item text-center"
                href="#"
                data-option="By method"
              >
                By method
              </a>
              <a
                className="dropdown-item text-center"
                href="#"
                data-option="By card"
              >
                By card
              </a>
            </div>
            <select className="btn dropdown-toggle">
              <option
                className="dropdown-item text-left"
                style={{ display: "none" }}
              >
                Search
              </option>

              <option
                className="dropdown-item text-left"
                data-option="By manager"
              >
                By manager
              </option>
              <option className="dropdown-item text-left" data-option="By date">
                By date
              </option>
              <option
                className="dropdown-item text-left"
                data-option="By player"
              >
                By player
              </option>
              <option
                className="dropdown-item text-left"
                data-option="By status"
              >
                By status
              </option>
              <option className="dropdown-item text-left" data-option="By desk">
                By desk
              </option>
              <option className="dropdown-item text-left" data-option="By sum">
                By sum
              </option>
              <option className="dropdown-item text-left" data-option="By type">
                By type
              </option>
              <option className="dropdown-item text-left" data-option="By ID">
                By ID
              </option>
              <option
                className="dropdown-item text-left"
                data-option="By method"
              >
                By method
              </option>
              <option className="dropdown-item text-left" data-option="By card">
                By card
              </option>
            </select>
            <input
              type="text"
              id="transactionsSearchInput"
              onkeyup="transactionSearch()"
              placeholder="Search.."
              className="p-1"
            />
          </div>
          <div>
            <button class="btn btn-secondary ml-2" id="editTransactions">
              Edit
            </button>
            <button class="btn btn-secondary ml-2" id="saveTransactions">
              Save
            </button>
          </div>
        </div>
        <table
          id="transactions-table"
          className="table table-hover table-striped"
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Player</th>
              <th>Type</th>
              <th>Sum</th>
              <th>Method</th>
              <th>Card</th>
              <th>Status</th>
              <th>Manager</th>
              <th>Desk</th>
              <th>Date</th>
              <th>FTD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Mark Otto</td>
              <td>Deposit</td>
              <td>100</td>
              <td>VISA</td>
              <td>0000111100001111</td>
              <td>Success</td>
              <td>Manager #1</td>
              <td>Desk #1</td>
              <td>21/08/2023</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>2</td>
              <td>John Doe</td>
              <td>Withdrawal</td>
              <td>200</td>
              <td>MasterCard</td>
              <td>1111000022223333</td>
              <td>Pending</td>
              <td>Manager #2</td>
              <td>Desk #2</td>
              <td>22/08/2023</td>
              <td>No</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Alice Johnson</td>
              <td>Transfer</td>
              <td>150</td>
              <td>PayPal</td>
              <td>5555666677778888</td>
              <td>Success</td>
              <td>Manager #3</td>
              <td>Desk #3</td>
              <td>23/08/2023</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>4</td>
              <td>Susan Johnson</td>
              <td>Withdrawal</td>
              <td>300</td>
              <td>Bitcoin</td>
              <td>0101010101010101</td>
              <td>Failed</td>
              <td>Manager #4</td>
              <td>Desk #4</td>
              <td>24/08/2023</td>
              <td>No</td>
            </tr>
            <tr>
              <td>5</td>
              <td>Michael Brown</td>
              <td>Deposit</td>
              <td>75</td>
              <td>Bank Transfer</td>
              <td>1001100010011000</td>
              <td>Success</td>
              <td>Manager #5</td>
              <td>Desk #5</td>
              <td>25/08/2023</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>6</td>
              <td>Laura Williams</td>
              <td>Withdrawal</td>
              <td>250</td>
              <td>Visa Electron</td>
              <td>1110000011111110</td>
              <td>Pending</td>
              <td>Manager #6</td>
              <td>Desk #6</td>
              <td>26/08/2023</td>
              <td>No</td>
            </tr>
            <tr>
              <td>7</td>
              <td>David Lee</td>
              <td>Deposit</td>
              <td>120</td>
              <td>Mastercard</td>
              <td>0000111111110000</td>
              <td>Success</td>
              <td>Manager #7</td>
              <td>Desk #7</td>
              <td>27/08/2023</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>8</td>
              <td>Emily Clark</td>
              <td>Withdrawal</td>
              <td>180</td>
              <td>PayPal</td>
              <td>1100110011001100</td>
              <td>Failed</td>
              <td>Manager #8</td>
              <td>Desk #8</td>
              <td>28/08/2023</td>
              <td>No</td>
            </tr>
            <tr>
              <td>9</td>
              <td>Robert Taylor</td>
              <td>Deposit</td>
              <td>95</td>
              <td>Bitcoin</td>
              <td>1010101010101010</td>
              <td>Success</td>
              <td>Manager #9</td>
              <td>Desk #9</td>
              <td>29/08/2023</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>10</td>
              <td>Sarah Hall</td>
              <td>Withdrawal</td>
              <td>280</td>
              <td>Bank Transfer</td>
              <td>0110010011000110</td>
              <td>Pending</td>
              <td>Manager #10</td>
              <td>Desk #10</td>
              <td>30/08/2023</td>
              <td>No</td>
            </tr>
            <tr>
              <td>1</td>
              <td>Mark Otto</td>
              <td>Deposit</td>
              <td>100</td>
              <td>VISA</td>
              <td>0000111100001111</td>
              <td>Success</td>
              <td>Manager #1</td>
              <td>Desk #1</td>
              <td>21/08/2023</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>2</td>
              <td>John Doe</td>
              <td>Withdrawal</td>
              <td>200</td>
              <td>Mastercard</td>
              <td>1111000011110000</td>
              <td>Pending</td>
              <td>Manager #2</td>
              <td>Desk #2</td>
              <td>22/08/2023</td>
              <td>No</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Jane Smith</td>
              <td>Deposit</td>
              <td>150</td>
              <td>PayPal</td>
              <td>0011001100110011</td>
              <td>Success</td>
              <td>Manager #3</td>
              <td>Desk #3</td>
              <td>23/08/2023</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>4</td>
              <td>Susan Johnson</td>
              <td>Withdrawal</td>
              <td>300</td>
              <td>Bitcoin</td>
              <td>0101010101010101</td>
              <td>Failed</td>
              <td>Manager #4</td>
              <td>Desk #4</td>
              <td>24/08/2023</td>
              <td>No</td>
            </tr>
            <tr>
              <td>5</td>
              <td>Michael Brown</td>
              <td>Deposit</td>
              <td>75</td>
              <td>Bank Transfer</td>
              <td>1001100010011000</td>
              <td>Success</td>
              <td>Manager #5</td>
              <td>Desk #5</td>
              <td>25/08/2023</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>6</td>
              <td>Laura Williams</td>
              <td>Withdrawal</td>
              <td>250</td>
              <td>Visa Electron</td>
              <td>1110000011111110</td>
              <td>Pending</td>
              <td>Manager #6</td>
              <td>Desk #6</td>
              <td>26/08/2023</td>
              <td>No</td>
            </tr>
            <tr>
              <td>7</td>
              <td>David Lee</td>
              <td>Deposit</td>
              <td>120</td>
              <td>Mastercard</td>
              <td>0000111111110000</td>
              <td>Success</td>
              <td>Manager #7</td>
              <td>Desk #7</td>
              <td>27/08/2023</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>8</td>
              <td>Emily Clark</td>
              <td>Withdrawal</td>
              <td>180</td>
              <td>PayPal</td>
              <td>1100110011001100</td>
              <td>Failed</td>
              <td>Manager #8</td>
              <td>Desk #8</td>
              <td>28/08/2023</td>
              <td>No</td>
            </tr>
            <tr>
              <td>9</td>
              <td>Robert Taylor</td>
              <td>Deposit</td>
              <td>95</td>
              <td>Bitcoin</td>
              <td>1010101010101010</td>
              <td>Success</td>
              <td>Manager #9</td>
              <td>Desk #9</td>
              <td>29/08/2023</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>10</td>
              <td>Sarah Hall</td>
              <td>Withdrawal</td>
              <td>280</td>
              <td>Bank Transfer</td>
              <td>0110010011000110</td>
              <td>Pending</td>
              <td>Manager #10</td>
              <td>Desk #10</td>
              <td>30/08/2023</td>
              <td>No</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
