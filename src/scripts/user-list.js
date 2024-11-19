import UserRow from "../components/user-row.js";

document.addEventListener("DOMContentLoaded", async () => {
    const access_token = localStorage.getItem('token');

    if(!access_token) {
        alert('Por favor, vuelva a iniciar sesión.')
        window.location.href = "../screens/index.html";
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

            console.log(response);

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "../screens/index.html";
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const userList = await response.json();
            renderUserList(userList);
            
        }catch (error) {
            console.error('Error fetching user list:', error);
            userListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; vertical-align: middle; width: 100%;">Error al cargar los usuarios</td></tr>`;
        }
    }

    async function handleDeleteUser(userIdNumber, userType) {
        const confirmDeleteModal = document.getElementById('confirmDeleteModal');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const modalBody = confirmDeleteModal.querySelector('.modal-body');

        const userTypeText = userType === 'EVALUATOR' ? 'evaluador' : 'evaluado';
        modalBody.textContent = `¿Está seguro que desea borrar a este usuario ${userTypeText}? Esta acción no puede ser revertida.`;

        const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
        const bootstrapConfirmDeleteModal = new bootstrap.Modal(confirmDeleteModal);
        bootstrapConfirmDeleteModal.show();

        cancelDeleteBtn.addEventListener("click", () => {
            bootstrapConfirmDeleteModal.hide();
        });

        confirmDeleteBtn.onclick = async () => {

            try {
                const url = new URL(`http://localhost:8080/users/userlist/delete/${userIdNumber}`);
                if (userType === 'EVALUATOR') {
                    url.searchParams.append('role', 'EVALUATOR');
                } else {
                    url.searchParams.append('typeOfEvaluated', userType);
                }

                const response = await fetch(url, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${access_token}`
                    },
                    method: "DELETE"
                });

                console.log(response);

                if (!response.ok) {
                    if (response.status === 401) {
                        window.location.href = "../index.html";
                        return;
                    }
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                if(response.status === 200) {
                    const closeSuccessBtn = document.getElementById("closeSuccessBtn");
                    const deleteSuccessModal = new bootstrap.Modal(document.getElementById("deleteSuccessModal"));
                    bootstrapConfirmDeleteModal.hide();
                    deleteSuccessModal.show();
                
                    closeSuccessBtn.addEventListener("click", () => {
                        deleteSuccessModal.hide();
                    });

                    setActiveButton(allBtn);
                    fetchAndRenderUsers();
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                const closeFailBtn = document.getElementById("closeFailBtn");
                const errorModal = new bootstrap.Modal(document.getElementById('deleteErrorModal'));
                errorModal.show();

                closeFailBtn.addEventListener("click", () => {
                    errorModal.hide();
                });
            }
        };
    }

    function renderUserList(filteredUsers) {
        userListBody.innerHTML = "";
        if (filteredUsers.length === 0) {
            userListBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; vertical-align: middle; width: 100%;">No hay usuarios para mostrar</td>
                </tr>`;
            return;
        }
        filteredUsers.forEach(user => {
            let userRow = new UserRow(user, handleDeleteUser);
            let component = userRow.render();
            if (component) userListBody.appendChild(component);
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




