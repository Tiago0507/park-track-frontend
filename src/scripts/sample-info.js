document.addEventListener("DOMContentLoaded", async () => {
    // Get parameters from URL
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const evaluatedId = urlParams.get('idNumber');
    const sampleID = urlParams.get('sampleId');
    const testTypeId = urlParams.get('testTypeId');

    // Validate parameters
    if (!validateRequiredParameters(token, evaluatedId, sampleID, testTypeId)) {
        return;
    }

    // Setup back button
    setupBackButton(evaluatedId);

    // Fetch and display sample details
    await fetchSampleDetails(sampleID, evaluatedId, testTypeId, token);
});

// Utility Functions
function validateRequiredParameters(token, evaluatedId, sampleID, testTypeId) {
    if (!token) {
        alert("No se encontró el token de autorización. Por favor, inicia sesión.");
        return false;
    }

    if (!evaluatedId) {
        alert("No se encontró el ID del evaluado. Por favor, selecciona un evaluado.");
        return false;
    }

    if (!sampleID) {
        alert("No se encontró el sample ID de la muestra.");
        return false;
    }

    if (!testTypeId) {
        alert("No se encontró el ID del test, por favor reintentar.");
        return false;
    }

    return true;
}

function setupBackButton(evaluatedId) {
    const backButton = document.getElementById("backButton");
    backButton.onclick = () => {
        window.location.href = `./samples-list.html?id=${evaluatedId}`;
    };
}

function getTestTypeString(testTypeId) {
    return testTypeId == 1 ? "Zapateo" : "Taconeo";
}

let originalDate = null;

function displaySampleDetails(data, testTypeId) {
    const typeTestString = getTestTypeString(testTypeId);

    if (!originalDate) {
        originalDate = new Date(data.date).toLocaleString() || "N/A";
    }

    document.getElementById("sampleId").textContent = data.id || "N/A";
    document.getElementById("sampleTypeOfTestId").textContent = typeTestString || "N/A";
    document.getElementById("sampleDate").textContent = originalDate;
    document.getElementById("sampleOnOffState").textContent = data.onOffState || "N/A";
    document.getElementById("sampleAptitude").textContent = data.aptitudeForTheTest || "N/A";


    const observationNotesContainer = document.getElementById("sampleObservationNotes");

    if (data.observationNotes && data.observationNotes.length > 0) {
        const notesHtml = data.observationNotes
            .map(note => `<li>${note.description}</li>`)
            .join('');

        observationNotesContainer.innerHTML = notesHtml;
    }else {
        observationNotesContainer.innerHTML = "<li>No hay notas disponibles.</li>";
    }
}

function setupEditModal(sampleID, evaluatedId, testTypeId, token) {
    const editBtn = document.getElementById('editBtn');
    const editSampleDataModal = document.getElementById('editSampleDataModal');
    const errorSavingChangesModal = new bootstrap.Modal(document.getElementById('saveChangesErrorModal'));
    const successSavingChangesModal = new bootstrap.Modal(document.getElementById('saveChangesSuccessModal'));
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const deleteObservationNotesBtn = document.getElementById("deleteObservationNotesBtn");
    const observationNotesTextArea = document.getElementById("observationNotesTextArea");
    const onOption = document.getElementById('onOption');
    const offOption = document.getElementById('offOption');

    editBtn.addEventListener('click', () => {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(editSampleDataModal);
        modalInstance.show();

        const existingNotes = document.querySelectorAll("#sampleObservationNotes li");
        const notesText = Array.from(existingNotes).map(note => note.textContent).join("\n");
        observationNotesTextArea.value = notesText || "";

        if (offOption.checked) {
            observationNotesTextArea.setAttribute("required", "true");
        } else {
            observationNotesTextArea.removeAttribute("required");
        }
    });

    deleteObservationNotesBtn.addEventListener("click", () => {
        observationNotesTextArea.value = "";
    });

    onOption.addEventListener("change", () => {
        observationNotesTextArea.removeAttribute("required");
    });

    offOption.addEventListener("change", () => {
        observationNotesTextArea.setAttribute("required", "true");
    });

    saveChangesBtn.addEventListener("click", async () => {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(editSampleDataModal);
        modalInstance.hide();

        await saveChanges(token, evaluatedId, sampleID, testTypeId, successSavingChangesModal, errorSavingChangesModal);
    });
}


function setupSensorCharts(data) {
    let sensor1ChartInstance = null;
    let sensor2ChartInstance = null;

    resetChart('sensor1Chart', sensor1ChartInstance);
    resetChart('sensor2Chart', sensor2ChartInstance);

    const sensor1Data = data.rawData?.sensors?.sensor1
        ? processSensorData(data.rawData.sensors.sensor1)
        : getEmptySensorData();
    const sensor2Data = data.rawData?.sensors?.sensor2
        ? processSensorData(data.rawData.sensors.sensor2)
        : getEmptySensorData();

    console.log(sensor1Data);
    console.log(sensor2Data);

    sensor1ChartInstance = createChart('sensor1Chart', sensor1Data, 'Sensor 1');
    sensor2ChartInstance = createChart('sensor2Chart', sensor2Data, 'Sensor 2');
}

async function fetchSampleDetails(sampleID, evaluatedId, testTypeId, token) {
    try {
        const url = `http://localhost:8080/samples?sampleID=${sampleID}&evaluatedId=${evaluatedId}&testTypeId=${testTypeId}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

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
        console.log("respuesta obtenida en el fetchSample:", data);

        // Display sample details
        displaySampleDetails(data, testTypeId);

        // Setup edit modal
        setupEditModal(sampleID, evaluatedId, testTypeId, token);

        // Setup sensor charts
        setupSensorCharts(data);

        return data;
    } catch (error) {
        console.error("Error:", error);
        alert("Error fetching: " + error.message);
    }
}


async function saveChanges(token, evaluatedId, sampleId, testTypeId, successModal, errorModal) {
    if (!token) {
        alert("No se encontró el token de autorización. Por favor, inicia sesión.");
        return;
    }

    const sampleOnOffState = document.querySelector('input[name="stateOptions"]:checked').value.toUpperCase();
    const sampleAptitude = document.getElementById("aptitude").value;
    const sampleObservationNotes = document.getElementById("observationNotesTextArea").value.split("\n").filter(note => note.trim() !== "");

    console.log(sampleOnOffState)
    console.log(sampleAptitude)
    console.log(sampleObservationNotes)

    if (sampleOnOffState === "OFF" && sampleObservationNotes.length === 0) {
        alert("Debe ingresar al menos una nota de observación si el estado es 'OFF'.");
        return;
    }

    if (!sampleAptitude) {
        alert("Debe seleccionar una aptitud para la prueba.");
        return;
    }    

    const updatedSample = {
        onOffState: sampleOnOffState,
        aptitudeForTheTest: sampleAptitude,
        notes: sampleObservationNotes
    };

    console.log(updatedSample)

    try {
        const url = `http://localhost:8080/samples/${evaluatedId}/${sampleId}/${testTypeId}`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedSample)
        });

        if (!response.ok) {
            console.error("Error al guardar los cambios:", await response.text());
            errorModal.show();
            return;
        }

        successModal.show();

        const data = {
            id: sampleId,
            evaluatedId: evaluatedId,
            testTypeId: testTypeId,
            date: originalDate,
            onOffState: sampleOnOffState,
            aptitudeForTheTest: sampleAptitude,
            observationNotes: sampleObservationNotes.map(note => ({ description: note }))
        };

        displaySampleDetails(data, testTypeId);
    } catch (error) {
        console.error("Error al realizar la solicitud:", error);
        errorModal.show(); // Mostrar modal de error
    }
}

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
        if (sample && typeof sample.timestamp === "number") {
            axData.push({ x: sample.timestamp, y: sample.ax });
            ayData.push({ x: sample.timestamp, y: sample.ay });
            azData.push({ x: sample.timestamp, y: sample.az });
            gxData.push({ x: sample.timestamp, y: sample.gx });
            gyData.push({ x: sample.timestamp, y: sample.gy });
            gzData.push({ x: sample.timestamp, y: sample.gz });
        }
    });

    return { axData, ayData, azData, gxData, gyData, gzData };
}

// Función para generar datos vacíos
function getEmptySensorData() {
    return {
        axData: [],
        ayData: [],
        azData: [],
        gxData: [],
        gyData: [],
        gzData: []
    };
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






