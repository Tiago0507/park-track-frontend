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

        evaluatedList.forEach(evaluated => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${evaluated.id}</td>
                <td>${evaluated.idNumber}</td>
                <td>${evaluated.firstName}</td>
                <td>${evaluated.lastName}</td>
                <td>${evaluated.email}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error:", error);
        alert("Error fetching evaluated list: " + error.message);
    }
});