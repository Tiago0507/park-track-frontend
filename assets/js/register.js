document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error("Registration failed");
        }

        const data = await response.json();
        alert("Registration successful. Please log in.");
    } catch (error) {
        console.error("Error:", error);
        alert("Error during registration");
    }
});

// Function to retrieve token from localStorage for other requests
function getToken() {
    return localStorage.getItem("token");
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