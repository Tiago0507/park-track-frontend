// DOM Elements
const form = document.getElementById('evaluationForm');
const testTypeSelect = document.getElementById('testType');
const testDescriptionDiv = document.getElementById('testDescriptionDiv');
const testDescriptionText = document.getElementById('testDescription');
const startTestButton = document.getElementById('iniciarPrueba');
const restartTest = document.getElementById('restartTest');
const notes = document.getElementById('notes');
const stateOnRadio = document.getElementById('stateOn');
const stateOffRadio = document.getElementById('stateOff');
const levodopaTimeDiv = document.getElementById('levodopaTimeDiv');
const levodopaTimeInput = document.getElementById('levodopaTime');

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No se encontró el token de autorización. Por favor, inicia sesión.");
        return;
    }

    // Initialize MQTT Client
    const client = createMQTTClient();

    // State Variables
    let currentSampleId = null;
    let currentTestTypeId = null;
    let testTypeMapping = new Map();

    // Check for existing patient ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const idNumber = urlParams.get('idNumber');
    searchPatient(idNumber, token).then(data => updatePatientInformation(data));

    // Event Listeners
    stateOnRadio.addEventListener('change', function () {
        if (this.checked) {
            levodopaTimeDiv.style.display = 'none';
            levodopaTimeInput.required = false;
        }
    });

    stateOffRadio.addEventListener('change', function () {
        levodopaTimeDiv.style.display = this.checked ? 'block' : 'none';
        levodopaTimeInput.required = this.checked;
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        currentSampleId = Date.now();
        restartTest.disabled = false;
    });

    testTypeSelect.addEventListener('change', async function () {
        const selectedTest = testTypeSelect.value;
        console.log('Selected Test:', selectedTest);

        if (selectedTest) {
            const result = await fetchTestDescription(selectedTest, token);
            currentTestTypeId = updateTestDescription(result, testDescriptionDiv, testDescriptionText);

            if (currentTestTypeId) {
                document.getElementById('patientStateDiv').style.display = 'block';
                document.getElementById('aptitudeDiv').style.display = 'block';
            }
        } else {
            testDescriptionDiv.style.display = 'none';
            testDescriptionText.value = '';
            currentTestTypeId = null;
            document.getElementById('patientStateDiv').style.display = 'none';
            document.getElementById('aptitudeDiv').style.display = 'none';
        }
    });

    restartTest.addEventListener('click', async function () {
        if (confirm('¿Está seguro que desea reiniciar la prueba? Los datos recolectados serán eliminados permanentemente.')) {
            const evaluatedId = document.getElementById('evaluatedId').textContent;

            if (currentSampleId && currentTestTypeId) {
                await deleteSample(evaluatedId, currentSampleId, currentTestTypeId, token);
            }

            resetFormAndUI();
            currentSampleId = null;
            currentTestTypeId = null;
            testTypeMapping.clear();
        }
    });

    startTestButton.addEventListener('click', async function () {
        startTestButton.disabled = true;

        const evaluatedId = document.getElementById('evaluatedId').textContent ||
            document.getElementById('patientId').value;
        const testTypeId = testTypeSelect.value;
        const patientState = document.querySelector('input[name="patientState"]:checked');
        const aptitudeValue = document.getElementById('aptitude').value;

        localStorage.setItem("notas", notes.value);

        if (evaluatedId && testTypeId && patientState && aptitudeValue) {
            const testMessage = `init~~${evaluatedId}~~${testTypeId}`;
            await startTest(client, testMessage);
            startTestButton.disabled = false;
        } else {
            alert('Por favor, complete todos los campos requeridos antes de iniciar la prueba.');
            startTestButton.disabled = false;
        }

        console.log('Evaluated ID:', evaluatedId);
        console.log('Test Type:', testTypeId);
        console.log('Patient State:', patientState);
        console.log('Aptitude:', aptitudeValue);
    });
});

function createMQTTClient() {
    const client = new Paho.MQTT.Client(
        'broker.hivemq.com',
        Number(8884),
        `A003781213Unicosuperunicoo`
    );

    const reconnectOptions = {
        useSSL: true, // Habilitar TLS/SSL
        onSuccess: function () {
            console.log("Conectado al servidor MQTT!");
            client.subscribe("test/icesi/dlp");
        },
        onFailure: function (message) {
            console.error("Connection failed: ", message.errorMessage || "Unknown error");
        },
        keepAliveInterval: 30,
        cleanSession: true
    };

    try {
        client.connect(reconnectOptions);
    } catch (e) {
        console.error("Error al conectarse al MQTT", e);
    }

    client.onConnectionLost = function (responseObject) {
        if (responseObject.errorCode !== 0) {
            console.error("Connection lost:", responseObject.errorMessage || "Unknown error");
            client.connect(reconnectOptions);
        }
    };

    return client;
}


// Patient Search Functionality
async function searchPatient(patientId, token) {
    if (!patientId) {
        alert('Por favor, ingrese el ID del evaluado');
        return null;
    }

    try {
        const response = await fetch(`http://localhost:8080/evaluated/details/${patientId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });

        if (response.status === 403) {
            alert('Debe iniciar sesión para buscar un paciente');
            window.location.href = './../screens/index.html';
            return;
        } else if (response.status === 404) {
            alert('Paciente no encontrado');
            return;
        } else if (!response.ok) {
            throw new Error('Error al buscar el paciente');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        alert(error.message);
        return null;
    }
}

// Update Patient Information in UI
function updatePatientInformation(data) {
    if (!data) {
        document.getElementById('evaluatedInfoDiv').style.display = 'none';
        return false;
    }

    // Update patient details
    document.getElementById('evaluatedId').textContent = data.idNumber;
    document.getElementById('evaluatedName').textContent = data.firstName;
    document.getElementById('evaluatedLastName').textContent = data.lastName;

    const birthDate = new Date(data.dateOfBirth);
    document.getElementById('evaluatedBirthDate').textContent =
        !isNaN(birthDate) ? birthDate.toLocaleDateString() : 'Fecha inválida';

    document.getElementById('evaluatedEmail').textContent = data.email;
    document.getElementById('evaluatedType').textContent = data.typeOfEvaluated;
    document.getElementById('evaluatedSex').textContent = data.sex;

    // Show/hide patient state and aptitude sections based on evaluated type
    const patientStateDiv = document.getElementById('patientStateDiv');
    const aptitudeDiv = document.getElementById('aptitudeDiv');
    const startTestButton = document.getElementById('iniciarPrueba');

    if (data.evaluated_type === 'Control') {
        patientStateDiv.style.display = 'none';
        aptitudeDiv.style.display = 'none';
    } else if (data.evaluated_type === 'Paciente') {
        patientStateDiv.style.display = 'block';
        aptitudeDiv.style.display = 'block';
    }

    document.getElementById('evaluatedInfoDiv').style.display = 'block';
    startTestButton.disabled = false;

    return true;
}

// Fetch Test Description
async function fetchTestDescription(selectedTest, token) {
    console.log('Selected Test:', selectedTest);
    if (!selectedTest) {
        return { success: false, data: null };
    }

    try {
        const response = await fetch(`http://localhost:8080/test-type/get-test-description?testType=${selectedTest}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error al obtener la descripción de la prueba:', error);
        return { success: false, data: null };
    }
}

// Update Test Description in UI
function updateTestDescription(result, testDescriptionDiv, testDescriptionText) {
    if (result.success) {
        testDescriptionText.value = result.data.description;
        testDescriptionDiv.style.display = 'block';
        return result.data.id;
    } else {
        testDescriptionDiv.style.display = 'none';
        testDescriptionText.value = '';
        return null;
    }
}

// Delete Sample
async function deleteSample(evaluatedId, currentSampleId, currentTestTypeId, token) {
    try {
        const response = await fetch(
            `http://localhost:8080/api/samples?evaluatedIdNumber=${evaluatedId}&id=${currentSampleId}&testTypeId=${currentTestTypeId}`,
            {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                console.log('La muestra ya no existe en la base de datos');
            } else {
                throw new Error('Error al eliminar la muestra');
            }
        }

        return true;
    } catch (error) {
        console.error('Error during reset:', error);
        alert('Hubo un error al reiniciar la prueba. Por favor, intente nuevamente.');
        return false;
    }
}

// Reset Form and UI
function resetFormAndUI() {
    const form = document.getElementById('evaluationForm');
    const startTestButton = document.getElementById('iniciarPrueba');
    const restartTest = document.getElementById('restartTest');

    form.reset();
    startTestButton.disabled = true;
    restartTest.disabled = false;

    document.getElementById('levodopaTimeDiv').style.display = 'none';
    document.getElementById('patientStateDiv').style.display = 'none';
    document.getElementById('aptitudeDiv').style.display = 'none';
    document.getElementById('evaluatedInfoDiv').style.display = 'none';
    document.getElementById('testDescriptionDiv').style.display = 'none';
    document.getElementById('resultSpace').innerHTML = 'Espacio para mostrar la gráfica resultante';
}

async function postObservationToLastSample(evaluatedId, testTypeId, notes) {
    const token = localStorage.getItem("token"); // Asegúrate de que el token existe

    if (!token) {
        console.error("No se encontró el token de autorización. Por favor, inicia sesión.");
        return;
    }

    const payload = {
        description: notes
    };

    try {
        const response = await fetch(`http://localhost:8080/samples/${evaluatedId}/${testTypeId}/observationToLastSample`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log("Observación enviada exitosamente:", responseData);
            alert("La observación se registró con éxito.");
        } else {
            const errorData = await response.json();
            console.error("Error al enviar la observación:", errorData);
            alert("No se pudo registrar la observación. Por favor, inténtalo nuevamente.");
        }
    } catch (error) {
        console.error("Error en la solicitud POST:", error);
        alert("Ocurrió un error al intentar enviar la observación.");
    }
}


// Start Test
function startTest(client, testMessage) {
    const mqttTestMessage = new Paho.MQTT.Message(testMessage);
    mqttTestMessage.destinationName = "test/icesi/dlp";
    client.send(mqttTestMessage);

    console.log(`Prueba iniciada: ${testMessage}`);

    return new Promise((resolve) => {
        setTimeout(async () => {
            const evaluatedId = testMessage.split('~~')[1];
            const testTypeId = testMessage.split('~~')[2];
            const notesValue = localStorage.getItem("notas"); // Recuperar las notas guardadas
            localStorage.removeItem("notas")
            alert('Prueba realizada con éxito para el paciente con ID: ' + evaluatedId);

            // Llamar a la función de observación después de 1 segundo
            if (evaluatedId && testTypeId && notesValue) {
                setTimeout(() => {
                    postObservationToLastSample(evaluatedId, testTypeId, notesValue);
                }, 1000); // 1 segundo después
            }

            resolve();
        }, 5500);
    });
}

