import UserRow from "../components/user-row.js";

document.addEventListener("DOMContentLoaded", async () => {
    const access_token = localStorage.getItem('token');

    if(!access_token) {
        alert('Por favor, vuelva a iniciar sesión.')
        window.location.href = "../index.html";
    }

    const userListBody = document.getElementById('userListBody');
    const evaluatorBtn = document.getElementById('evaluatorBtn');
    const patientBtn = document.getElementById('patientBtn');
    const controlBtn = document.getElementById('controlBtn');
    const allBtn = document.getElementById('allBtn');

    async function fetchAndRenderUsers(params = {}) {
        const url = new URL("http://localhost:8080/users/userlist");
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}`
                },
                method: "GET"
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "../index.html";
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const userList = await response.json();
            renderUserList(userList);
            
        }catch (error) {
            console.error('Error fetching user list:', error);
            userListBody.innerHTML = `<tr><td colspan="4">Error loading users</td></tr>`;
        }
    }

    function renderUserList(filteredUsers) {
        userListBody.innerHTML = "";
        filteredUsers.forEach(user => {
            let userRow = new UserRow(user);
            let component = userRow.render();
            userListBody.appendChild(component);
        });
    }

    function setActiveButton(activeButton) {
        const buttons = [evaluatorBtn, patientBtn, controlBtn, allBtn];
        buttons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    setActiveButton(allBtn);
    fetchAndRenderUsers();

    evaluatorBtn.addEventListener('click', () => {
        setActiveButton(evaluatorBtn);
        fetchAndRenderUsers({ role: 'EVALUATOR' });
    });

    patientBtn.addEventListener('click', () => {
        setActiveButton(patientBtn);
        fetchAndRenderUsers({ typeOfEvaluated: 'Paciente' });
    });

    controlBtn.addEventListener('click', () => {
        setActiveButton(controlBtn);
        fetchAndRenderUsers({ typeOfEvaluated: 'Control' });
    });

    allBtn.addEventListener('click', () => {
        setActiveButton(allBtn);
        fetchAndRenderUsers();
    });
});




