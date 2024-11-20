document.addEventListener("DOMContentLoaded", async () => {
    let sensor1ChartInstance = null;
    let sensor2ChartInstance = null;
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const evaluatedId = urlParams.get('idNumber');
    const sampleID =urlParams.get('sampleId');
    const testTypeId = urlParams.get('testTypeId');

      if (!token) {
        alert("No se encontró el token de autorización. Por favor, inicia sesión.");
        return;
    }

    if (!evaluatedId) {
        alert("No se encontró el ID del evaluado. Por favor, selecciona un evaluado.");
        return;
    }

    if (!sampleID) {
        alert("No se encontró el sample ID de la muestra.");
        return;
    }

    if (!testTypeId) {
        alert("No se encontró el ID del test, por favor reintentar.");
        return;
    }

    
    console.log("ID del evaluado:", evaluatedId);
    console.log("ID del tipo de test:", testTypeId);

    try {
        const response = await fetch(`http://localhost:8080/hardware_controller/sample?sampleID=${sampleID}&evaluatedId=${evaluatedId}&testTypeId=${testTypeId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        console.log(response);
        if (!response.ok) {
            if (response.status === 500) {
                console.error('Error 500: La muestra no existe.');
                alert('La muestra no existe.');
            } else {
                alert('Error al obtener los datos del servidor.');
            }
            throw new Error('Error en la respuesta del servidor.');
        }

        

        const data = await response.json();
        document.getElementById("sampleId").textContent = data.id || "N/A";
        document.getElementById("sampleTypeOfTestId").textContent = testTypeId || "N/A";
        document.getElementById("sampleDate").textContent = new Date(data.date).toLocaleString() || "N/A";
        document.getElementById("sampleDescription").textContent = data.description || "N/A";
        document.getElementById("sampleOnOffState").textContent = data.onOffState || "N/A";
        document.getElementById("sampleAptitude").textContent = data.aptitudeForTheTest || "N/A";
        document.getElementById("sampleComments").textContent = data.comments.join(", ") || "N/A";

        const commentsContainer = document.getElementById("sampleComments");
        if (Array.isArray(data.comments) && data.comments.length > 0) {
            data.comments.forEach(comment => {
                const li = document.createElement("li");
                li.textContent = comment;
                commentsContainer.appendChild(li);
            });
        } else {
            commentsContainer.textContent = "Sin comentarios.";
        }
        console.log(data);

        // Procesamos los datos obtenidos de los sensores
        const sensor1Data = processSensorData(data.rawData.sensors.sensor1.sample1);
        const sensor2Data = processSensorData(data.rawData.sensors.sensor1.sample2);
    
        // Limpiamos los gráficos existentes antes de graficar
        resetChart('sensor1Chart', sensor1ChartInstance);
        resetChart('sensor2Chart', sensor2ChartInstance);
    
        // Graficamos los datos para cada sensor
        sensor1ChartInstance = createChart('sensor1Chart', sensor1Data, 'Sensor 1');
        sensor2ChartInstance = createChart('sensor2Chart', sensor2Data, 'Sensor 2');
    

        
    } catch (error) {
        console.error("Error:", error);
        alert("Error fetching: " + error.message);
    }
});

// Función para procesar los datos de un sensor
function processSensorData(sensor) {
    const samples = Object.values(sensor);
    const axData = [];
    const ayData = [];
    const azData = [];
    const gxData = [];
    const gyData = [];
    const gzData = [];

    // Llenamos los arrays con los valores respectivos
    samples.forEach(sample => {
        axData.push({ x: sample.timestamp, y: sample.ax });
        ayData.push({ x: sample.timestamp, y: sample.ay });
        azData.push({ x: sample.timestamp, y: sample.az });
        gxData.push({ x: sample.timestamp, y: sample.gx });
        gyData.push({ x: sample.timestamp, y: sample.gy });
        gzData.push({ x: sample.timestamp, y: sample.gz });
    });

    return { axData, ayData, azData, gxData, gyData, gzData };
}

// Función para limpiar el gráfico antes de crear uno nuevo
function resetChart(canvasId, chartInstance) {
    if (chartInstance) {
        chartInstance.destroy(); // Destruimos la instancia anterior del gráfico si existe
    }
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiamos el canvas
}

// Función para crear la gráfica de dispersión (scatter chart)
function createChart(canvasId, data, label) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    return new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: `${label} - ax`,
                    data: data.axData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    pointRadius: 5,
                    showLine: true
                },
                {
                    label: `${label} - ay`,
                    data: data.ayData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    pointRadius: 5,

                    showLine: true
                },
                {
                    label: `${label} - az`,
                    data: data.azData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    pointRadius: 5,
                    showLine: true
                },
                {
                    label: `${label} - gx`,
                    data: data.gxData,
                    backgroundColor: 'rgba(255, 206, 86, 0.6)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    pointRadius: 5,
                    showLine: true
                },
                {
                    label: `${label} - gy`,
                    data: data.gyData,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    pointRadius: 5,
                    showLine: true
                },
                {
                    label: `${label} - gz`,
                    data: data.gzData,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    pointRadius: 5,
                    showLine: true
                }
            ]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Timestamp'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            }
        }
    });
}






