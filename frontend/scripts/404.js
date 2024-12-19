document.addEventListener('DOMContentLoaded', () => {
    redirectToLogin();
});

async function redirectToLogin() {
    document.querySelector('#goHome').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = './dashboard.html';
    });
}