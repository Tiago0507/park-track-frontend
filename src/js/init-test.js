document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('evaluationForm');
    const stateOffRadio = document.getElementById('stateOff');
    const levodopaTimeDiv = document.getElementById('levodopaTimeDiv');
    const levodopaTimeInput = document.getElementById('levodopaTime');
    const restartTest = document.getElementById('restartTest');

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
});
