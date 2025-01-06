const API_BASE_URL = CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();

    document.querySelector('.logout').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    document.querySelector('#changepassword').addEventListener('click', (e) => {
        e.preventDefault();
        changePass();
    });

    document.querySelector('.back-btn').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/pages/dashboard.html';
    });
});

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/user/profile`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const user = await response.json();
        
        const studentNameElement = document.getElementById('studentName');
        const studentDetailsElement = document.getElementById('studentDetails');
        const studentPhoneNumber = document.getElementById('phonenumber');
        const studentEmail = document.getElementById('email');
        const studentDetails = document.getElementById('studentDetails');
        const studentIIN = document.getElementById('iin');
        const studentStatus = document.getElementById('status');
        const studentClassNumber = document.getElementById('classnumber');
        
        studentNameElement.textContent = `${user.user.name} ${user.user.surname}`;
        studentDetailsElement.textContent = `${user.user.school || 'School'} | ${user.user.class || 'Class'}`;
        studentPhoneNumber.textContent = `${user.user.phoneNum}`;
        studentEmail.textContent = `${user.user.email}`;
        studentIIN.textContent = `${user.user.IIN}`;
        studentStatus.textContent = `${user.user.who}`;
        studentClassNumber.textContent = `${user.user.class}`;

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function changePass() {
    const oldPass = document.getElementById('oldpassword').value;
    const newPass = document.getElementById('newpassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/user/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
        });
        if (response.ok) {
            alert('Password changed successfully');
        } else {
            alert('Failed to change password');
        }
    } catch (error) {
        console.error('Error changing password:', error);
    }   
}


function logout() {
    localStorage.removeItem('token');
    window.location.href = '/pages/login.html';
}