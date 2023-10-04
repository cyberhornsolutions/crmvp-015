// Initialize an empty array to store generated codes
const generatedCodes = [];

// Function to generate a random code of a specified length
function generateRandomCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
}

// Function to generate a unique code
function generateUniqueCode(length) {
  let code;
  
  do {
    code = generateRandomCode(length);
  } while (generatedCodes.includes(code));

  generatedCodes.push(code);
  return code;
}

// Function to populate the placeholder attribute of <input> elements with unique codes
function populateReferralCodes() {
  const inputElements = document.querySelectorAll('#profile input');
  
  inputElements.forEach((element, index) => {
    const uniqueCode = generateUniqueCode(8);
    element.placeholder = `${uniqueCode}`;
  });
}

// Call the function to populate the <input> elements with unique codes in their placeholders
populateReferralCodes();