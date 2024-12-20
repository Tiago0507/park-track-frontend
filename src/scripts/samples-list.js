document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const evaluatedId = new URLSearchParams(window.location.search).get("id");

    const usernameElement = document.getElementById("username-in-session");

    if (!token) {
        Swal.fire({
            icon: "error",
            title: "Token no encontrado",
            text: "No se encontró el token de autorización. Por favor, inicia sesión.",
        });
        return;
    }

    const parsedToken = parseJwt(token);

    usernameElement.textContent = parsedToken.sub || "Usuario desconocido";

    if (!evaluatedId) {
        Swal.fire({
            icon: "warning",
            title: "ID del evaluado faltante",
            text: "No se encontró el ID del evaluado. Por favor, selecciona un evaluado.",
        });
        return;
    }

    console.log("Token encontrado:", token);
    console.log("ID del evaluado:", evaluatedId);

    try {
        const response = await fetch(`http://localhost:8080/samples/${evaluatedId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });

        console.log("Estado de la respuesta:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const samplesList = await response.json();
        console.log(samplesList.comments)
        const tableBody = document.querySelector("#samples-list");

        samplesList.forEach(sample => {
            const row = document.createElement("tr");
            console.log(sample.id)
            console.log(sample)
            console.log(sample.comments)
            row.onclick = function () {
                window.location.href = './sample-view.html?idNumber=' + evaluatedId + "&sampleId=" + sample.id + "&testTypeId=" + sample.typeOfTestId + "&sampleComment=" + sample.comments;
            };

            row.innerHTML = `
                <td>${sample.id}</td>
                <td>${new Date(sample.date).toLocaleDateString()}</td>
                <td>${sample.description}</td>
                <td>${sample.onOffState}</td>
            `;
            console.log(sample);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error al obtener la lista de muestras",
            text: error.message || "Ocurrió un error inesperado al obtener la lista de muestras.",
        });
    }

    function parseJwt(token) {
        if (!token) {
            return null;
        }
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    }
});