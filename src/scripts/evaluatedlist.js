document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("No se encontró el token de autorización. Por favor, inicia sesión.");
        return;
    }

    console.log("Token encontrado:", token);

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

        const evaluatedList = await response.json();
        const tableBody = document.querySelector("#evaluated-list");

        const headerRow = document.querySelector(".table thead tr");
        if (!headerRow.querySelector('th[data-field="samples"]')) {
            const samplesHeader = document.createElement("th");
            samplesHeader.textContent = "Muestras";
            samplesHeader.setAttribute("data-field", "samples");
            headerRow.appendChild(samplesHeader);
        }

        for (const evaluated of evaluatedList) {
            const samplesResponse = await fetch(`http://localhost:8080/sample/samples/${evaluated.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const samples = await samplesResponse.json();
            const samplesCount = samples.length;

            const row = document.createElement("tr");
            row.onclick = function() { 
                window.location.href = './evaluated-info.html?idNumber=' + evaluated.idNumber;
            };

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
                </td>
            `;
            

            const samplesLink = row.querySelector('.samples-link');
            samplesLink.style.color = '#696cff';
            samplesLink.style.textDecoration = 'none';
            samplesLink.addEventListener('mouseenter', () => {
                samplesLink.style.textDecoration = 'underline';
            });
            samplesLink.addEventListener('mouseleave', () => {
                samplesLink.style.textDecoration = 'none';
            });

            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error fetching evaluated list: " + error.message);
    }
});

const searchInput = document.querySelector('input[placeholder="Buscar..."]');
const evaluatedTable = document.querySelector("#evaluated-list");

function filterTable(searchTerm) {
    const rows = evaluatedTable.getElementsByTagName("tr");
    searchTerm = searchTerm.toLowerCase();

    Array.from(rows).forEach(row => {
        let textContent = '';
        Array.from(row.getElementsByTagName("td")).forEach(cell => {
            textContent += cell.textContent + ' ';
        });
        textContent = textContent.toLowerCase();

        if (textContent.includes(searchTerm)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

function initializeSearch() {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        filterTable(searchTerm);
    });

    searchInput.closest('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    searchInput.addEventListener('search', () => {
        filterTable('');
    });
}

if (searchInput && evaluatedTable) {
    initializeSearch();
} else {
    console.error('No se encontraron los elementos necesarios para la búsqueda');
}
