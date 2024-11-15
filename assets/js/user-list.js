import UserRow from "./UserRow";

const access_token = window.localStorage.getItem('access_token');

if(access_token === null) {
    location.href = '../../src/screens/index.html';
}

const userListBody = document.getElementById('userListBody');

const getAllUsers = async (token) => {
    try{
        let response = await fetch('/users/userlist', {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            method: 'GET'
        });

        if (!response.ok) {
            if (response.status === 401) {
                location.href = '../../src/screens/index.html';
                return;
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        let userList = await response.json();
        console.log(userList);
    
        userList.forEach(user => {
            let userRow = new UserRow(user);
            let component = userRow.render();
            userListBody.appendChild(component);
        });
    }catch (error) {
        console.error('Error fetching user list:', error)
    }
}

getAllUsers(access_token);

