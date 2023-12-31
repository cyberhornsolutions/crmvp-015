const menumain = document.getElementById('logo')
const menudash = document.getElementById('menu-dash');
const menuleads = document.getElementById('menu-leads');
const menutransactions = document.getElementById('menu-transactions');
const menuusers = document.getElementById('menu-users');
const menucalendar = document.getElementById('menu-calendar');
const menuaffiliates = document.getElementById('menu-affiliates');
const menuplatform = document.getElementById('menu-platform');
const menunews = document.getElementById('menu-news');


const menuIDs = [
  'logo',
  'menu-dash',
  'menu-leads',
  'menu-transactions',
  'menu-users',
  'menu-calendar',
  'menu-affiliates',
  'menu-platform',
  'menu-news'
];

const tabmain = document.getElementById('mainboard');
const tabdash = document.getElementById('dashboard');
const tableads = document.getElementById('leads');
const tabtransactions = document.getElementById('transactions');
const tabusers = document.getElementById('users');
const tabcalendar = document.getElementById('calendar');
const tabaffiliates = document.getElementById('affiliates');
const tabnews = document.getElementById('news');

const tabIDs = [
  'mainboard',
  'dashboard',
  'leads',
  'transactions',
  'users',
  'calendar',
  'affiliates',
  'news'
];

const tabtitle = document.getElementById('tab-title')
const leadnameEl = document.getElementById('lead-name')
const profilename = document.getElementById('profile-name')

const leadTransactionsName = document.getElementById('lead-transactions-name')

function showMain() {
  menuIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element.classList.contains('active')) {
      element.classList.remove('active');
    }
  });

  tabIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none'
    }
  });
  
  tabmain.style.display = 'flex';
  menumain.classList.add('active')
  tabtitle.textContent = 'Player'
}

// Function to hide the leads table and show the dashboard
function showDashboard() {
  menuIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element.classList.contains('active')) {
      element.classList.remove('active');
    }
  });

  tabIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none'
    }
  });

  tabdash.style.display = 'flex';
  menudash.classList.add('active')
  tabtitle.textContent = 'Dashboard'
}

// Function to hide the dashboard and show the leads table
function showLeads() {
  const leadsDiv = document.getElementById('leads-div')
  const leadTransactionsDiv = document.getElementById('lead-transactions')

  menuIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element.classList.contains('active')) {
      element.classList.remove('active');
    }
  });

  tabIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none'
    }
  });

  tableads.style.display = 'flex'
  menuleads.classList.add('active')
  leadsDiv.classList.remove('hidden')
  leadTransactionsDiv.classList.remove('hidden')
  tabtitle.textContent = 'Players'
}

function showTransactions() {
  menuIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element.classList.contains('active')) {
      element.classList.remove('active');
    }
  });

  tabIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none'
    }
  });

  tabtransactions.style.display = 'flex';
  menutransactions.classList.add('active')
  tabtitle.textContent = 'Transactions'
}

function showUsers() {
  const usersDiv = document.getElementById('users-div')
  const newUserForm = document.getElementById('newUser-form')

  menuIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element.classList.contains('active')) {
      element.classList.remove('active');
    }
  });

  tabIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none'
    }
  });
  usersDiv.classList.remove('hidden')
  newUserForm.classList.remove('hidden')
  tabusers.style.display = 'flex';
  menuusers.classList.add('active')
  tabtitle.textContent = 'Managers'
}

function showCalendar() {
  menuIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element.classList.contains('active')) {
      element.classList.remove('active');
    }
  });

  tabIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none'
    }
  });
  
  tabcalendar.style.display = 'flex';
  menucalendar.classList.add('active')
  tabtitle.textContent = 'Calendar'
}

const leadsTableRows = document.querySelectorAll("#leadsTable tbody tr");
const leadCardButton = document.getElementById('lead-card-button')
const leadTransactionsBody = document.querySelector('#lead-transactions-bottom-table tbody')

// Loop through each row and add a click event listener
leadsTableRows.forEach((row) => {
  row.addEventListener("click", function () {
    // Get the name from the clicked row
    const leadName = row.querySelector("td:nth-child(3)").textContent;
    leadTransactionsName.textContent = leadName;
    leadTransactionsBody.classList.remove('hidden');
  });
});

leadCardButton.addEventListener('click', function() {
  menuIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element.classList.contains('active')) {
      element.classList.remove('active');
    }
  });
  
  tabIDs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none'
    }
  });
    
  tabmain.style.display = 'flex';
  menumain.classList.add('active')
  tabtitle.textContent = 'Player card';
  leadnameEl.textContent = leadTransactionsName.textContent;
  profilename.placeholder = leadTransactionsName.textContent;
})

// Add click event listeners to the menu items
menumain.addEventListener('click', showMain)
menudash.addEventListener('click', showDashboard);
menuleads.addEventListener('click', showLeads);
menutransactions.addEventListener('click', showTransactions);
menuusers.addEventListener('click', showUsers);
menucalendar.addEventListener('click', showCalendar);

function myFunction() {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[2];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
// Get a reference to the button element
var logoutButton = document.getElementById("logout-button");

// Add a click event listener to the button
logoutButton.addEventListener("click", function() {
    // Redirect the user to the login.html page
    window.location.href = "login-crm.html";
});

var platformLink = document.getElementById('menu-platform');

platformLink.addEventListener('click', function() {
  const urlToOpen = 'login.html';
            // Open the URL in a new tab
            window.open(urlToOpen, '_blank');
})