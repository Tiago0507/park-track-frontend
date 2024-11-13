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
            throw new Error("Login failed");
        }

        const data = await response.json();
        
        // Save token to localStorage
        localStorage.setItem("token", data.token);

        // Decode the JWT to get the role
        const role = getRoleFromToken(data.token);

        // Redirect based on role
        if (role === "ADMIN") {
            window.location.replace("/src/screens/admin/search-admin.html");
        } else if (role === "EVALUATOR") {
            window.location.replace("/src/screens/evaluator/search-evaluator.html");
        } else {
            throw new Error("Unrecognized role");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error during login this is what i know" + error);
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
    }
}