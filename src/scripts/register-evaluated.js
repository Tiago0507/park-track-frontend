async function submitForm() {
    const VALID_GENDERS = {
        MASCULINO: "Masculino",
        FEMENINO: "Femenino"
    };

    const VALID_EVALUATED_TYPES = {
        PACIENTE: "Paciente",
        CONTROL: "Control"
    };

    const formFields = {
        id_number: document.getElementById("id_number").value,
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        date_of_birth: document.getElementById("date_of_birth").value,
        email: document.getElementById("email").value,
        family_history_parkinson: document.getElementById("family_history_parkinson").value,
        height: parseFloat(document.getElementById("height").value),
        weight: parseFloat(document.getElementById("weight").value),
        evaluated_type: document.getElementById("evaluated_type").value,
        sex: document.getElementById("gender").value
    };

    const emptyFields = Object.entries(formFields)
        .filter(([key, value]) => {
            if (key === 'height' || key === 'weight') {
                return isNaN(value);
            }
            return !value;
        })
        .map(([key]) => key);

    if (emptyFields.length > 0) {
        alert(`Por favor complete los siguientes campos: ${emptyFields.join(', ')}`);
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/evaluated/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formFields)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            let errorMessage = 'Error al agregar evaluado.';
            
            if (errorData) {
                if (errorData.message && errorData.message.includes('SexNotFoundException')) {
                    errorMessage = `Valor de género inválido: ${formFields.sex}. Por favor seleccione Masculino o Femenino.`;
                } else if (errorData.message && errorData.message.includes('TypeOfEvaluatedNotFoundException')) {
                    errorMessage = `Valor de tipo de evaluado inválido: ${formFields.evaluated_type}. Por favor seleccione Paciente o Control.`;
                } else {
                    errorMessage = errorData.message || errorMessage;
                }
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        alert("¡Evaluado agregado exitosamente!");
        document.getElementById("userForm").reset();
        
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

function resetForm() {
    document.getElementById("userForm").reset();
}