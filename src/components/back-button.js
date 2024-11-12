function goBack() {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.back-button').addEventListener('click', goBack);
});
