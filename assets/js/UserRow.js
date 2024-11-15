export default class UserRow {
    constructor(user) {
        this.user = user;
    }

    render() {
        let row = document.createElement('tr');

        let userIdNumber = document.createElement('td');
        userIdNumber.textContent = this.user.idNumber;

        let userName = document.createElement('td');
        userName.textContent = this.user.firstname;

        let userLastname = document.createElement('td');
        userLastname.textContent = this.user.lastname;

        let userEmail = document.createElement('td');
        userEmail.textContent = this.user.email;

        let userType = document.createElement('td');
        let userTypeSpan = document.createElement('span');
        userTypeSpan.classList.add('badge', 'me-1');
        if (this.user.userType === 'EVALUATOR') {
            userTypeSpan.classList.add('bg-label-success');
            userTypeSpan.textContent = 'Evaluador';
        } else if (this.user.userType === 'EVALUATED') {
            userTypeSpan.classList.add('bg-label-primary');
            userTypeSpan.textContent = 'Evaluado';
        }
        userType.appendChild(userTypeSpan);

        let userAction = document.createElement('td');
        let dropdown = document.createElement('div');
        dropdown.classList.add('dropdown');

        let dropdownButton = document.createElement('button');
        dropdownButton.type = 'button';
        dropdownButton.classList.add('btn', 'p-0', 'dropdown-toggle', 'hide-arrow');
        dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
        dropdownButton.innerHTML = '<i class="bx bx-dots-vertical-rounded"></i>';

        let dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('dropdown-menu');

        let editItem = document.createElement('a');
        editItem.classList.add('dropdown-item');
        editItem.href = 'javascript:void(0);';
        editItem.innerHTML = '<i class="bx bx-edit-alt me-2"></i> Editar';

        let deleteItem = document.createElement('a');
        deleteItem.classList.add('dropdown-item');
        deleteItem.href = 'javascript:void(0);';
        deleteItem.innerHTML = '<i class="bx bx-trash me-2"></i> Eliminar';

        dropdownMenu.appendChild(editItem);
        dropdownMenu.appendChild(deleteItem);

        dropdown.appendChild(dropdownButton);
        dropdown.appendChild(dropdownMenu);
        userAction.appendChild(dropdown);

        row.appendChild(userId);
        row.appendChild(userName);
        row.appendChild(userLastname);
        row.appendChild(userEmail);
        row.appendChild(userType);
        row.appendChild(userAction);

        return row;
    }
}