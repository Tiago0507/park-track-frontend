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
    console.log(userType);

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
    fetch(`http://127.0.0.1:8080/${userType == "evaluator" ? "evaluators" : "evaluated"}/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
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
        .then(() => {
            Swal.fire({
                icon: "success",
                title: `${userType === "evaluator" ? "Evaluador" : "Evaluado"} registrado con éxito`,
                showConfirmButton: false,
                timer: 2000
            });
            resetForm(false);
        })
        .catch(error => {
            if (error.message.includes("Usuario duplicado")) {
                Swal.fire({
                    icon: "warning",
                    title: "Error",
                    text: "El usuario ya existe con ese nombre de usuario.",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error al registrar el usuario",
                    text: error.message,
                });
            }
        });
}

function resetForm(showNotification = true) {
    document.getElementById("userForm").reset();
    document.getElementById("evaluatorFields").style.display = "none";
    document.getElementById("evaluatedFields").style.display = "none";

    if (showNotification) {
        Swal.fire({
            icon: "info",
            title: "Formulario reiniciado",
            text: "Puedes ingresar nuevos datos para registrar otro usuario.",
            showConfirmButton: false,
            timer: 2000
        });
    }
}
