document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const evaluatedId = new URLSearchParams(window.location.search).get("id");

    if (!token) {
        alert("No se encontró el token de autorización. Por favor, inicia sesión.");
        return;
    }

    if (!evaluatedId) {
        alert("No se encontró el ID del evaluado. Por favor, selecciona un evaluado.");
        return;
    }

    console.log("Token encontrado:", token);
    console.log("ID del evaluado:", evaluatedId);

    try {
        const response = await fetch(`http://localhost:8080/sample/samples/${evaluatedId}`, {
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

        const samplesList = await response.json();
        const tableBody = document.querySelector("#samples-list");

        samplesList.forEach(sample => {
            const row = document.createElement("tr");
            console.log(sample.id)
            row.onclick = function() { 
                window.location.href = './sample-view.html?idNumber=' + evaluatedId + "&sampleId=" + sample.id + "&testTypeId=" + sample.typeOfTestId;
            };

            row.innerHTML = `
                <td>${sample.id}</td>
                <td>${new Date(sample.date).toLocaleDateString()}</td>
                <td>${sample.description}</td>
                <td>${sample.onOffState}</td>
                <td>${sample.comments.join(", ")}</td>
            `;
            console.log(sample);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error:", error);
        alert("Error fetching samples list: " + error.message);
    }
});