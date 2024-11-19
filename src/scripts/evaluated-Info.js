document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const evaluatedId = urlParams.get('idNumber');
    if (!evaluatedId) {
        alert("No se encontró el ID del evaluado.");
        return;
    }
    if (!token) {
        alert("No se encontró el token de autorización. Por favor, inicia sesión.");
        return;
    }
    try {
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
        const evaluated = await response.json();

        document.getElementById('evaluated-id').textContent = evaluated.id;
        document.getElementById('evaluated-firstName').textContent = evaluated.firstName;
        document.getElementById('evaluated-lastName').textContent = evaluated.lastName;
        document.getElementById('evaluated-email').textContent = evaluated.email;
        document.getElementById('evaluated-familyHistoryParkinson').textContent = evaluated.familyHistoryParkinson 
        document.getElementById('evaluated-height').textContent = evaluated.height 
        document.getElementById('evaluated-weight').textContent = evaluated.weight 
        document.getElementById('evaluated-typeOfEvaluated').textContent = evaluated.typeOfEvaluated 
        document.getElementById('evaluated-sex').textContent = evaluated.sex 

    } catch (error) {
        console.error('Error al cargar los detalles del evaluado:', error);
        alert("Error al obtener los detalles del evaluado: " + error.message);
    }

    document.querySelector('.back-button').addEventListener('click', goBack);
});


function goBack() {
    window.history.back();
}
