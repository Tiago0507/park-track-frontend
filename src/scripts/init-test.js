const okbtn = document.getElementById('okbtn');
client = new Paho.MQTT.Client('broker.hivemq.com', Number(8000), "ESP32ClienteMicasaA00395902");

//Listener de mensajes
// client.onMessageArrived = function (msg) {
//     console.log("Arrived!: " + msg.payloadString);
// }

//Función para conectarse al broker
client.connect({
    onSuccess: function () {
        console.log("Conectado al servidor MQTT!")
        client.subscribe("test/icesi/dlp");
    }
});


// Manejar la respuesta de la ESP32
// client.onMessageArrived = (message) => {
//     console.log("Arrived!: " + message.payloadString);
//     const response = JSON.parse(message.payloadString);

//     if (response.status === "ok") {
//         // Si no hay errores, habilitar el botón e iniciar la prueba
//         console.log('No hay errores, iniciando prueba...');

//     } else {
//         // Si hay un error, mostrar alerta y desactivar el botón por 5 segundos
//         console.log('Error en la conexión: ' + response.message);
//         alert(`Error: ${response.message}`);

//         setTimeout(() => {
//             startTestButton.disabled = false; // Habilitar el botón después de 5 segundos
//             stopTestButton.disabled = true;
//         }, 5000); // Bloquear el botón por 5 segundos
//     }
// };


var testInProgress = false;




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
    // const stopTestButton = document.getElementById('stopTest')
    // const stopTestModal = new bootstrap.Modal(document.getElementById('stopTestModal'));



    // stopTestButton.disabled = true;

    // function toggleStopButton() {
    //     stopTestButton.disabled = !testInProgress; 
    // }


    let currentSampleId = null;
    let currentTestTypeId = null;
    let testTypeMapping = new Map();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No se encontró el token de autorización. Por favor, inicia sesión.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idNumber = urlParams.get('idNumber');
    if (idNumber) {
        document.getElementById('patientId').value = idNumber;
        searchPatient(idNumber);
    }

    const stateOnRadio = document.getElementById('stateOn');
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

    searchPatientBtn.addEventListener('click', function () {
        const patientId = document.getElementById('patientId').value;
        searchPatient(patientId);
      });
    
      function searchPatient(patientId) {
        if (patientId) {
          fetch(`http://localhost:8080/api/patient/${patientId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })
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
      }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        console.log('Form submitted');
        currentSampleId = Date.now();
        restartTest.disabled = false;
    });

    restartTest.addEventListener('click', async function () {
        if (confirm('¿Está seguro que desea reiniciar la prueba? Los datos recolectados serán eliminados permanentemente.')) {
            try {
                if (currentSampleId && currentTestTypeId) {
                    const evaluatedId = document.getElementById('evaluatedId').textContent;
                    console.log('ID del evaluado:', evaluatedId);
                    console.log('ID del tipo de prueba:', currentTestTypeId);
                    console.log('Eliminando muestra:', currentSampleId);

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
                }

                form.reset();
                testInProgress = false;
                startTestButton.disabled = true;
                // toggleStopButton();
                // this.disabled = true;
                levodopaTimeDiv.style.display = 'none';
                patientStateDiv.style.display = 'none';
                aptitudeDiv.style.display = 'none';
                startTestButton.disabled = true; // Deshabilitar el botón al reiniciar la prueba

                document.getElementById('evaluatedInfoDiv').style.display = 'none';
                document.getElementById('testDescriptionDiv').style.display = 'none';
                document.getElementById('resultSpace').innerHTML = 'Espacio para mostrar la gráfica resultante';

                currentSampleId = null;
                currentTestTypeId = null;
                testTypeMapping.clear();

            } catch (error) {
                console.error('Error during reset:', error);
                alert('Hubo un error al reiniciar la prueba. Por favor, intente nuevamente.');
            }
        }
    });

    // Manejar el cambio en el selector de tipo de prueba
    testTypeSelect.addEventListener('change', function () {
        const selectedTest = testTypeSelect.value;

        // Si se selecciona una prueba, hacer una petición al backend
        if (selectedTest) {
        fetch(`http://localhost:8080/api/getTestDescription?testType=${selectedTest}`, {
            headers: {
            "Authorization": `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Mostrar la descripción de la prueba
            testDescriptionText.value = data.description;
            testDescriptionDiv.style.display = 'block';
            testTypeMapping.set(selectedTest, data.id);
            currentTestTypeId = data.id;

            // Mostrar los campos adicionales
            patientStateDiv.style.display = 'block';
            aptitudeDiv.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            testDescriptionDiv.style.display = 'none';
            testDescriptionText.value = '';
            console.error('Error al obtener la descripción de la prueba:', error);
        });
        } else {
        // Si no se selecciona ninguna prueba, ocultar la descripción
        testDescriptionDiv.style.display = 'none';
        testDescriptionText.value = '';
        currentTestTypeId = null;

        // Ocultar los campos adicionales
        patientStateDiv.style.display = 'none';
        aptitudeDiv.style.display = 'none';
        }
    });

    startTestButton.addEventListener('click', function () {
        // Bloquear temporalmente el botón de inicio de prueba
        startTestButton.disabled = true;

        testInProgress = true;
        // stopTestButton.disabled = false;

        // Publicar un mensaje para verificar si hay errores
        // const checkErrorMessage = 'check_error';
        // const mqttCheckMessage = new Paho.MQTT.Message(checkErrorMessage);
        // // mqttCheckMessage.destinationName = "test/icesi/dlp/check";
        // mqttCheckMessage.destinationName = "test/icesi/dlp";
        // client.send(mqttCheckMessage);
        const evaluatedId = document.getElementById('evaluatedId').textContent || 
                    document.getElementById('patientId').value;
        const testTypeId = testTypeSelect.value;
        const patientState = document.querySelector('input[name="patientState"]:checked');
        const aptitudeValue = document.getElementById('aptitude').value;

        // Verificar que todos los campos necesarios no estén vacíos
        if (evaluatedId && testTypeId && patientState && aptitudeValue) {
            // Publicar el mensaje para iniciar la prueba
            const testMessage = `init~~${evaluatedId}~~${testTypeId}`;
            const mqttTestMessage = new Paho.MQTT.Message(testMessage);
            mqttTestMessage.destinationName = "test/icesi/dlp";
            client.send(mqttTestMessage);

            // toggleStopButton();

            console.log(`Prueba iniciada: ${testMessage}`);
            setTimeout(() => {
                alert('Prueba realizada con exito para el paciente con id: ' + evaluatedId);

                // Habilitar el botón nuevamente
                startTestButton.disabled = false;
            }, 5500)
        } else {
            alert('Por favor, complete todos los campos requeridos antes de iniciar la prueba.');
            startTestButton.disabled = false; // Habilitar el botón si faltan campos
        }

        // console.log('Mensaje enviado para verificar errores.');

        // // Suscribirse al tópico para esperar la respuesta
        // client.subscribe("test/icesi/dlp/check_response");

        console.log('Evaluated ID:', evaluatedId);
        console.log('Test Type:', testTypeId);
        console.log('Patient State:', patientState);
        console.log('Aptitude:', aptitudeValue);
    });


    // stopTestButton.addEventListener('click', () => {
    //     // Detener el muestreo enviando un mensaje MQTT al ESP32
    //     const message = "stop";
    //     const mqttMessage = new Paho.MQTT.Message(message);
    //     mqttMessage.destinationName = "test/icesi/dlp";

    //     client.send(mqttMessage);
    //     console.log(`Mensaje enviado: ${message}`);
    //     console.log("Muestreo detenido");

    //     stopTestModal.show();

    //     testInProgress = false;

    //     stopTestButton.disabled = true;

    //     startTestButton.disabled = false;
    // });

});
