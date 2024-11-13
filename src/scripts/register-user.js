document.getElementById("user-type").addEventListener("change", function () {
    const userType = this.value;
    document.getElementById("evaluatorFields").style.display = userType === "evaluator" ? "block" : "none";
    document.getElementById("evaluatedFields").style.display = userType === "evaluated" ? "block" : "none";
});

function submitForm() {
    const userType = document.getElementById("user-type").value;
    const commonData = {
        id_number: document.getElementById("id_number").value,
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        email: document.getElementById("email").value
    };

    let userData;

    if (userType === "evaluator") {
        userData = {
            ...commonData,
            password: document.getElementById("password").value,
            role: "EVALUATOR"
        };
    } else if (userType === "evaluated") {
        userData = {
            ...commonData,
            sex: document.getElementById("gender").value,
            date_of_birth: document.getElementById("date_of_birth").value,
            family_history_parkinson: document.getElementById("family_history_parkinson").value,
            height: document.getElementById("height").value,
            weight: document.getElementById("weight").value,
            evaluated_type: document.getElementById("evaluated_type").value
        };
    }

    console.log(userData);
    // Realizar la solicitud de registro
    fetch(`http://127.0.0.1:8080/${userType === "evaluator" ? "evaluators" : "patients"}/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                // Manejo de errores según el status
                if (response.status === 409) {
                    throw new Error("Usuario duplicado");
                } else {
                    throw new Error("Error en el registro. Código de estado: " + response.status);
                }
            }
        })
        .then(data => {
            alert(`${userType === "evaluator" ? "Evaluador" : "Evaluado"} registrado con éxito`);
            resetForm();
        })
        .catch(error => {
            if (error && error.message) {
                // Manejo de error específico para el usuario duplicado
                if (error.message.includes("duplicate key")) {
                    alert("Error: El usuario ya existe con ese nombre de usuario.");
                } else {
                    alert("Error al registrar el usuario: " + error.message);
                }
            } else {
                // Manejo de errores generales
                alert("Ocurrió un error inesperado al registrar. Por favor, intente de nuevo.");
            }
        });
}

function resetForm() {
    document.getElementById("userForm").reset();
    document.getElementById("evaluatorFields").style.display = "none";
    document.getElementById("evaluatedFields").style.display = "none";
}
