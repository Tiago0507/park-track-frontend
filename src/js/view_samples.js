   let sensor1ChartInstance = null;
let sensor2ChartInstance = null;

document.getElementById('queryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const sampleID = document.getElementById('sampleID').value;
    const evaluatedId = document.getElementById('evaluatedId').value;
    const testTypeId = document.getElementById('testTypeId').value;

    // URL del endpoint con parámetros dinámicos
    const url = `http://localhost:8080/hardware_controller/sample?sampleID=${sampleID}&evaluatedId=${evaluatedId}&testTypeId=${testTypeId}`;

    // Realizamos la solicitud al endpoint
    fetch(url)
        .then(response => {
            if (!response.ok) {
                if (response.status === 500) {
                    console.error('Error 500: La muestra no existe.');
                    return Promise.reject('La muestra no existe.');
                }
                return Promise.reject('Error al obtener los datos del servidor.');
            }
            return response.json();
        })
        .then(data => {
            // Procesamos los datos obtenidos de los sensores
            const sensor1Data = processSensorData(data.rawData.sensors.sensor1);
            const sensor2Data = processSensorData(data.rawData.sensors.sensor2);

            // Limpiamos los gráficos existentes antes de graficar
            resetChart('sensor1Chart', sensor1ChartInstance);
            resetChart('sensor2Chart', sensor2ChartInstance);

            // Graficamos los datos para cada sensor
            sensor1ChartInstance = createChart('sensor1Chart', sensor1Data, 'Sensor 1');
            sensor2ChartInstance = createChart('sensor2Chart', sensor2Data, 'Sensor 2');
        })
        .catch(error => console.error('Error al obtener los datos:', error));
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
                    pointRadius: 5
                },
                {
                    label: `${label} - ay`,
                    data: data.ayData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    pointRadius: 5
                },
                {
                    label: `${label} - az`,
                    data: data.azData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    pointRadius: 5
                },
                {
                    label: `${label} - gx`,
                    data: data.gxData,
                    backgroundColor: 'rgba(255, 206, 86, 0.6)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    pointRadius: 5
                },
                {
                    label: `${label} - gy`,
                    data: data.gyData,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    pointRadius: 5
                },
                {
                    label: `${label} - gz`,
                    data: data.gzData,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    pointRadius: 5
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

