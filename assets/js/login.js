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

        alert("Login successful");
    } catch (error) {
        console.error("Error:", error);
        alert("Error during login");
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