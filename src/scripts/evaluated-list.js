// Function to check and validate token
function validateToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("No se encontró el token de autorización. Por favor, inicia sesión.");
    return null;
  }
  console.log("Token encontrado:", token);
  return token;
}

// Function to fetch evaluated list
async function fetchEvaluatedList(token) {
  try {
    const response = await fetch("http://localhost:8080/evaluated/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    console.log("Estado de la respuesta:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching evaluated list:", error);
    throw error;
  }
}

// Function to fetch samples for a specific evaluated
async function fetchSamplesForEvaluated(token, evaluatedId) {
  try {
    const samplesResponse = await fetch(`http://localhost:8080/samples/${evaluatedId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    return await samplesResponse.json();
  } catch (error) {
    console.error(`Error fetching samples for evaluated ${evaluatedId}:`, error);
    throw error;
  }
}

// Function to add samples column to table header if not exists
function ensureSamplesColumnExists() {
  const headerRow = document.querySelector(".table thead tr");
  if (!headerRow.querySelector('th[data-field="samples"]')) {
    const samplesHeader = document.createElement("th");
    samplesHeader.textContent = "Muestras";
    samplesHeader.setAttribute("data-field", "samples");
    headerRow.appendChild(samplesHeader);
  }
}

// Function to create and style a row for an evaluated
function createEvaluatedRow(evaluated, samplesCount, token) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${evaluated.id}</td>
    <td>${evaluated.idNumber}</td>
    <td>${evaluated.firstName}</td>
    <td>${evaluated.lastName}</td>
    <td>${evaluated.email}</td>
    <td>
      <a href="samples-list.html?id=${evaluated.id}" class="samples-link">
        ${samplesCount} ${samplesCount === 1 ? 'muestra' : 'muestras'}
      </a>
      <button class="btn btn-sm btn-primary add-sample-btn small-btn" data-idnumber="${evaluated.idNumber}">
        <i class="bx bx-plus"></i>
      </button>
    </td>
  `;

  // Row click navigation
  row.addEventListener('click', (event) => {
    if (!event.target.closest('.samples-link') && !event.target.closest('.add-sample-btn')) {
      window.location.href = `evaluated-info.html?idNumber=${evaluated.idNumber}`;
    }
  });

  // Samples link styling
  const samplesLink = row.querySelector('.samples-link');
  samplesLink.style.color = '#696cff';
  samplesLink.style.textDecoration = 'none';
  samplesLink.addEventListener('mouseenter', () => {
    samplesLink.style.textDecoration = 'underline';
  });
  samplesLink.addEventListener('mouseleave', () => {
    samplesLink.style.textDecoration = 'none';
  });

  return row;
}

// Function to add event listeners to add sample buttons
function setupAddSampleButtons() {
  document.querySelectorAll('.add-sample-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const idNumber = event.currentTarget.getAttribute('data-idnumber');
      window.location.href = `./init-test.html?idNumber=${idNumber}`;
    });
  });
}

// Main function to populate evaluated list
async function populateEvaluatedList() {
  try {
    // Validate token
    const token = validateToken();
    if (!token) return;

    // Fetch evaluated list
    const evaluatedList = await fetchEvaluatedList(token);

    // Prepare table body
    const tableBody = document.querySelector("#evaluated-list");

    // Ensure samples column exists
    ensureSamplesColumnExists();

    // Populate rows
    for (const evaluated of evaluatedList) {
      // Fetch samples for each evaluated
      const samples = await fetchSamplesForEvaluated(token, evaluated.id);
      const samplesCount = samples.length;

      // Create and append row
      const row = createEvaluatedRow(evaluated, samplesCount, token);
      tableBody.appendChild(row);
    }

    // Setup add sample buttons
    setupAddSampleButtons();

  } catch (error) {
    console.error("Error:", error);
    alert("Error fetching evaluated list: " + error.message);
  }
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Event listener that only calls the main function
document.addEventListener("DOMContentLoaded", populateEvaluatedList);
const username = document.getElementById("username-in-session")
token = parseJwt(localStorage.getItem("token"))
username.textContent = token.sub
console.log(username.textContent)
