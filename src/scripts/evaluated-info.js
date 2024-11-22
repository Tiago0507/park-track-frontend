document.addEventListener("DOMContentLoaded", async () => {
    try {
        const evaluatedId = getEvaluatedIdFromURL();
        const token = getTokenFromLocalStorage();

        if (!evaluatedId || !token) {
            return;
        }

        const evaluated = await fetchEvaluatedDetails(evaluatedId, token);
        updateEvaluatedDetailsDOM(evaluated);

    } catch (error) {
        console.error('Error al cargar los detalles del evaluado:', error);
        alert("Error al obtener los detalles del evaluado: " + error.message);
    }

    backBtn = document.getElementById('back-btn');
    backBtn.addEventListener('click', goBack);
});

function getEvaluatedIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const evaluatedId = urlParams.get('idNumber');
    if (!evaluatedId) {
        alert("No se encontró el ID del evaluado.");
    }
    return evaluatedId;
}

function getTokenFromLocalStorage() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No se encontró el token de autorización. Por favor, inicia sesión.");
    }
    return token;
}

async function fetchEvaluatedDetails(evaluatedId, token) {
    const response = await fetch(`http://localhost:8080/evaluated/details/${evaluatedId}`, {
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

    return response.json();
}

function updateEvaluatedDetailsDOM(evaluated) {
    document.getElementById('evaluated-id').textContent = evaluated.idNumber || 'N/A';
    document.getElementById('evaluated-firstName').textContent = evaluated.firstName || 'N/A';
    document.getElementById('evaluated-lastName').textContent = evaluated.lastName || 'N/A';
    document.getElementById('evaluated-email').textContent = evaluated.email || 'N/A';
    document.getElementById('evaluated-dateOfBirth').textContent = 
        evaluated.dateOfBirth ? new Date(evaluated.dateOfBirth).toLocaleDateString() : 'N/A';
    document.getElementById('evaluated-familyHistoryParkinson').textContent = evaluated.familyHistoryParkinson;
    document.getElementById('evaluated-height').textContent = evaluated.height || 'N/A';
    document.getElementById('evaluated-weight').textContent = evaluated.weight || 'N/A';
    document.getElementById('evaluated-typeOfEvaluated').textContent = evaluated.typeOfEvaluated || 'N/A';
    document.getElementById('evaluated-sex').textContent = evaluated.sex || 'N/A';
}

function goBack() {
    window.history.back();
}
