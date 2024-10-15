const okbtn = document.getElementById('okbtn');
client = new Paho.MQTT.Client('broker.hivemq.com', Number(8000), "ESP32ClienteIcesiA00394479");

//Listener de mensajes
client.onMessageArrived = function (msg) {
    console.log("Arrived!: " + msg.payloadString);
}

//Función para conectarse al broker
client.connect({
    onSuccess: function () {
        console.log("Conectado al servidor MQTT!")
        client.subscribe("test/icesi/dlp");
    }
});


document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('evaluationForm');
    const stateOffRadio = document.getElementById('stateOff');
    const levodopaTimeDiv = document.getElementById('levodopaTimeDiv');
    const levodopaTimeInput = document.getElementById('levodopaTime');
    const restartTest = document.getElementById('restartTest');

    const testTypeSelect = document.getElementById('testType');
    const testDescriptionDiv = document.getElementById('testDescriptionDiv');
    const testDescriptionText = document.getElementById('testDescription');
    const searchPatientBtn = document.getElementById('searchPatient');
    const patientStateDiv = document.getElementById('patientStateDiv');
    const aptitudeDiv = document.getElementById('aptitudeDiv');
    const startTestButton = document.getElementById('iniciarPrueba');

    stateOffRadio.addEventListener('change', function () {
        levodopaTimeDiv.style.display = this.checked ? 'block' : 'none';
        levodopaTimeInput.required = this.checked;
    });

    searchPatientBtn.addEventListener('click', function () {
        const patientId = document.getElementById('patientId').value;
        if (patientId) {
            fetch(`http://localhost:8080/api/patient/${patientId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Paciente no encontrado');
                    }
                    return response.json();
                })
                .then(data => {
                    // Mostrar la información del evaluado
                    document.getElementById('evaluatedId').textContent = data.idNumber;
                    document.getElementById('evaluatedName').textContent = data.firstName;
                    document.getElementById('evaluatedLastName').textContent = data.lastName;
                    document.getElementById('evaluatedBirthDate').textContent = new Date(data.dateOfBirth).toLocaleDateString();
                    document.getElementById('evaluatedEmail').textContent = data.email;
                    document.getElementById('evaluatedType').textContent = data.typeOfEvaluated;
                    document.getElementById('evaluatedSex').textContent = data.sex;

                    // Mostrar el contenedor de información del evaluado
                    document.getElementById('evaluatedInfoDiv').style.display = 'block';

                    if (data.typeOfEvaluated === 'Control') {
                        patientStateDiv.style.display = 'none';
                        aptitudeDiv.style.display = 'none';
                    } else if (data.typeOfEvaluated === 'Paciente') {
                        patientStateDiv.style.display = 'block';
                        aptitudeDiv.style.display = 'block';
                    }

                    // Habilitar el botón Iniciar prueba si el paciente existe
                    startTestButton.disabled = false;
                })
                .catch(error => {
                    alert(error.message); // Mostrar alerta si no se encuentra el paciente
                    patientStateDiv.style.display = 'none';
                    aptitudeDiv.style.display = 'none';
                    startTestButton.disabled = true; // Deshabilitar el botón
                    // Ocultar el contenedor de información del evaluado si no se encuentra
                    document.getElementById('evaluatedInfoDiv').style.display = 'none';
                });
        } else {
            alert('Por favor, ingrese el ID del evaluado');
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        console.log('Form submitted');
        restartTest.disabled = false;
    });

    restartTest.addEventListener('click', function () {
        form.reset();
        this.disabled = true;
        levodopaTimeDiv.style.display = 'none';
        patientStateDiv.style.display = 'none';
        aptitudeDiv.style.display = 'none';
        startTestButton.disabled = true; // Deshabilitar el botón al reiniciar la prueba
    });

    // Manejar el cambio en el selector de tipo de prueba
    testTypeSelect.addEventListener('change', function () {
        const selectedTest = testTypeSelect.value;

        // Si se selecciona una prueba, hacer una petición al backend
        if (selectedTest) {
            fetch(`http://localhost:8080/api/getTestDescription?testType=${selectedTest}`)
                .then(response => response.json())
                .then(data => {
                    // Mostrar la descripción de la prueba
                    testDescriptionText.value = data.description;
                    testDescriptionDiv.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error al obtener la descripción de la prueba:', error);
                });
        } else {
            // Si no se selecciona ninguna prueba, ocultar la descripción
            testDescriptionDiv.style.display = 'none';
            testDescriptionText.value = '';
        }
    });

    startTestButton.addEventListener('click', function () {
        // Comprobar que todos los campos requeridos están llenos
        const evaluatedId = document.getElementById('evaluatedId').textContent;
        const testTypeId = testTypeSelect.value; // Este debe ser el ID del tipo de prueba
        const patientState = document.querySelector('input[name="patientState"]:checked'); // Estado del paciente
        const levodopaTimeValue = levodopaTimeInput.value; // Última toma de Levodopa
        const aptitudeValue = document.getElementById('aptitude').value; // Aptitud para la prueba

        // Verificar que todos los campos necesarios no estén vacíos
        if (evaluatedId && testTypeId && patientState && aptitudeValue) {
            // Publicar el mensaje en el formato requerido
            const message = `init~~${evaluatedId}~~${testTypeId}`;
            const mqttMessage = new Paho.MQTT.Message(message);
            mqttMessage.destinationName = "test/icesi/dlp";
            client.send(mqttMessage);

            console.log(`Mensaje enviado: ${message}`);
        } else {
            alert('Por favor, complete todos los campos requeridos antes de iniciar la prueba.');
        }
    });

});
