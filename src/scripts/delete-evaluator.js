document.addEventListener('DOMContentLoaded', function () {
    let evaluatorIdToDelete = null;

    // Event delegation for delete button clicks within the table
    document.querySelector('.table tbody').addEventListener('click', function (event) {
        if (event.target.classList.contains('btn-danger')) {
            // Set the evaluator ID to delete based on the button's data-id attribute
            evaluatorIdToDelete = event.target.getAttribute('data-id');
            const confirmModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
            confirmModal.show();
        }
    });

    // Handle deletion when confirmed
    document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
        if (evaluatorIdToDelete) {
            // Retrieve the token from localStorage
            const token = localStorage.getItem("token");

            fetch(`http://localhost:8080/evaluators/delete/${evaluatorIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, // Authorization header with token
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        alert("Evaluator successfully deleted.");
                        // Remove the row from the table
                        const row = document.querySelector(`button[data-id='${evaluatorIdToDelete}']`).closest('tr');
                        row.remove();
                    } else {
                        alert("Error: Unable to delete evaluator. Please try again later.");
                    }
                })
                .catch(error => {
                    alert("Error: Unable to delete evaluator. Please check your connection and try again.");
                })
                .finally(() => {
                    evaluatorIdToDelete = null; // Reset the evaluator ID after deletion attempt
                    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
                    confirmModal.hide(); // Hide the modal
                });
        }
    });
});

