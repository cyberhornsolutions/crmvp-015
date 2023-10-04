// Function to enable editing mode for the table cells
function enableEditing() {
  const tableCells = document.querySelectorAll('#menu3-table tbody td');
  tableCells.forEach((cell) => {
    const text = cell.textContent;
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = text;
    inputElement.style.width = '80px'; // Adjust the width as needed
    cell.innerHTML = '';
    cell.appendChild(inputElement);
  });
}

// Function to disable editing mode and save the changes
function disableEditing() {
  const tableCells = document.querySelectorAll('#menu3-table tbody td');
  tableCells.forEach((cell) => {
    const input = cell.querySelector('input');
    if (input) {
      cell.textContent = input.value;
    }
  });
}

// Add event listeners to the buttons
const menu3edit = document.getElementById('menu3-edit');
const menu3save = document.getElementById('menu3-save');

menu3edit.addEventListener('click', enableEditing);
menu3save.addEventListener('click', disableEditing);
