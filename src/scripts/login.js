document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            if (response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Credenciales inválidas',
                    text: 'El nombre de usuario o la contraseña son incorrectos.',
                });
            } else {
                throw new Error("Error en el inicio de sesión.");
            }
            return;
        }

        const data = await response.json();
        
        // Save token to localStorage
        localStorage.setItem("token", data.token);

        // Decode the JWT to get the role
        const role = getRoleFromToken(data.token);

        // Redirect based on role
        if (role === "ADMIN") {
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: 'Redirigiendo al panel de administrador...',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.replace("/src/screens/admin/search-admin.html");
            });
        } else if (role === "EVALUATOR") {
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: 'Redirigiendo al panel del evaluador...',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.replace("/src/screens/evaluator/search-evaluator.html");
            });
        } else {
            throw new Error("Unrecognized role");
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error durante el inicio de sesión',
            text: error.message || 'Hubo un problema con la solicitud.',
        });
    }
});

// Function to retrieve token from localStorage for other requests
function getToken() {
    return localStorage.getItem("token");
}

// Function to decode JWT and retrieve the role
function getRoleFromToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role; 
}

// Example: Function to make authenticated requests
async function makeAuthenticatedRequest() {
    const token = getToken();

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Token no encontrado',
            text: 'Por favor, inicia sesión nuevamente.',
        });
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/some-protected-endpoint", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        console.log("Protected data:", data);
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de red',
            text: error.message || 'Hubo un problema al realizar la solicitud.',
        });
    }
}