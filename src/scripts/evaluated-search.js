const evaluatedSearchInput = document.querySelector('input[placeholder="Buscar..."]');
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
    evaluatedSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        filterTable(searchTerm);
    });

    evaluatedSearchInput.closest('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    evaluatedSearchInput.addEventListener('search', () => {
        filterTable('');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (evaluatedSearchInput && evaluatedTable) {
        initializeSearch();
    } else {
        console.error('No se encontraron los elementos necesarios para la búsqueda');
    }
});