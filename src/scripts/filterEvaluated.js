document.addEventListener("DOMContentLoaded", () => {
    const filterForm = document.getElementById("filterForm");
    
    filterForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No se encontró el token de autorización. Por favor, inicia sesión.");
            return;
        }
        
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const nameRangeStart = document.getElementById("nameRangeStart").value;
        const nameRangeEnd = document.getElementById("nameRangeEnd").value;
        const typeOfEvaluated = document.getElementById("typeOfEvaluated").value;
        const sortBy = document.getElementById("sortBy").value;
        const sortDirection = document.getElementById("sortDirection").value;
        
        const queryParams = new URLSearchParams({
            startDate,
            endDate,
            nameRangeStart,
            nameRangeEnd,
            typeOfEvaluated,
            sortBy,
            sortDirection
        });
        
        try {
            const response = await fetch(`http://localhost:8080/evaluated/filter?${queryParams.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const evaluatedList = await response.json();
            const tableBody = document.querySelector("#evaluated-list");
            tableBody.innerHTML = "";
            
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
});