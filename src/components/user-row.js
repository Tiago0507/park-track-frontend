export default class UserRow {
    constructor(user, onDelete) {
        this.user = user;
        this.onDelete = onDelete;
    }

    render() {
        if (this.user.role === 'ADMIN') {
            return null;
        }
        
        let row = document.createElement('tr');
        let userIdNumber = document.createElement('td');
        userIdNumber.textContent = this.user.idNumber;

        let userName = document.createElement('td');
        userName.textContent = this.user.firstName;

        let userLastname = document.createElement('td');
        userLastname.textContent = this.user.lastName;

        let userEmail = document.createElement('td');
        userEmail.textContent = this.user.email;

        let userType = document.createElement('td');
        let userTypeSpan = document.createElement('span');
        userTypeSpan.classList.add('badge', 'me-1');
        if(this.user.role === 'EVALUATOR') {
            userTypeSpan.textContent = 'Evaluador';
            userTypeSpan.classList.add('bg-label-success');
        }else if(this.user.typeOfEvaluated) {
            userTypeSpan.textContent = this.user.typeOfEvaluated === 'Paciente' ? 'Paciente' : 'Control';
            userTypeSpan.classList.add(
                this.user.typeOfEvaluated === 'Paciente' ? 'bg-label-primary' : 'bg-label-info'
            );
        }
        userType.appendChild(userTypeSpan);

        let userAction = document.createElement('td');
        let deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger');
        deleteBtn.innerHTML = '<i class="bx bx-trash"></i>'; 
        userAction.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', () => {
            const userType = this.user.role === 'EVALUATOR' ? 'EVALUATOR' : this.user.typeOfEvaluated;
            this.onDelete(this.user.idNumber, userType);
        });

        row.appendChild(userIdNumber);
        row.appendChild(userName);
        row.appendChild(userLastname);
        row.appendChild(userEmail);
        row.appendChild(userType);
        row.appendChild(userAction);

        return row;
    }
}