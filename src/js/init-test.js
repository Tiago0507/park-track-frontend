document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('evaluationForm');
    const stateOffRadio = document.getElementById('stateOff');
    const levodopaTimeDiv = document.getElementById('levodopaTimeDiv');
    const levodopaTimeInput = document.getElementById('levodopaTime');
    const restartTest = document.getElementById('restartTest');

    const testTypeSelect = document.getElementById('testType');
    const testDescriptionDiv = document.getElementById('testDescriptionDiv');
    const testDescriptionText = document.getElementById('testDescription');

    stateOffRadio.addEventListener('change', function () {
        levodopaTimeDiv.style.display = this.checked ? 'block' : 'none';
        levodopaTimeInput.required = this.checked;
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Here you would typically send the data to a server
        console.log('Form submitted');
        restartTest.disabled = false;
    });

    restartTest.addEventListener('click', function () {
        form.reset();
        this.disabled = true;
        levodopaTimeDiv.style.display = 'none';
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
});
