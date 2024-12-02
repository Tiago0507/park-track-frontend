async function submitForm() {
    // Gather form values
    const idNumber = document.getElementById("id_number").value;
    const firstName = document.getElementById("first_name").value;
    const lastName = document.getElementById("last_name").value;
    const dateOfBirth = document.getElementById("date_of_birth").value;
    const email = document.getElementById("email").value;
    const familyHistoryParkinson = document.getElementById("family_history_parkinson").value;
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const typeOfEvaluated = document.getElementById("evaluated_type").value;
    const sex = document.getElementById("gender").value;

    // Check if any required fields are empty
    if (!idNumber || !firstName || !lastName || !dateOfBirth || !email || !familyHistoryParkinson || !typeOfEvaluated || !sex || isNaN(height) || isNaN(weight)) {
        Swal.fire({
            icon: "warning",
            title: "Campos incompletos",
            text: "Por favor completa todos los campos requeridos.",
        });
        return;
    }

    // Create payload for the POST request
    const payload = {
        id_number: idNumber,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        email: email,
        family_history_parkinson: familyHistoryParkinson,
        height: height,
        weight: weight,
        evaluated_type: typeOfEvaluated,
        sex: sex
    };

    try {
        const response = await fetch("http://localhost:8080/evaluated/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("No se pudo registrar el evaluado. Inténtalo nuevamente.");
        }

        const data = await response.json();
        Swal.fire({
            icon: "success",
            title: "Evaluado registrado",
            text: "El evaluado se ha registrado correctamente.",
            showConfirmButton: false,
            timer: 2000
        });

        // Optionally, reset the form or redirect
        document.getElementById("userForm").reset();
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error al registrar el evaluado",
            text: error.message || "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
        });
    }
}

function resetForm() {
    // Select the form and reset all its fields
    document.getElementById("userForm").reset();
    Swal.fire({
        icon: "info",
        title: "Formulario reiniciado",
        text: "Puedes ingresar nuevos datos para registrar otro evaluado.",
        showConfirmButton: false,
        timer: 2000
    });

}
