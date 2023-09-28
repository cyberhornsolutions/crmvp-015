const editTransctactions = document.getElementById('editTransactions')
const saveTransactions = document.getElementById('saveTransactions')

document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("transactions-table");
  const cells = table.getElementsByTagName("td");

  // Add click event listeners to each cell
  for (let i = 0; i < cells.length; i++) {
      cells[i].addEventListener("click", function () {
          const cell = cells[i];

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
});
